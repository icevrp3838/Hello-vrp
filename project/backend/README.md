# VRP Progress — Deploy with a real database (Cloudflare Pages + D1)

This turns the prototype into a **real multi-user web app** backed by
**Cloudflare D1** (a managed SQLite database) with serverless API routes
(**Pages Functions**) and salted-PBKDF2 password auth.

Everything runs on Cloudflare's free tier for a college-sized deployment.

```
project/
├─ index.html, *.jsx, styles.css   ← the frontend (static)
├─ db.js                           ← frontend API client (auto-detects backend)
├─ wrangler.toml                   ← Cloudflare config (set your D1 id)
├─ functions/api/                  ← serverless API (runs on Cloudflare)
│   ├─ _lib.js          auth + helpers
│   ├─ login.js         POST /api/login
│   ├─ offerings.js     GET/POST /api/offerings
│   ├─ offerings/[id].js PUT/DELETE /api/offerings/:id
│   ├─ grades.js        GET/POST /api/grades
│   ├─ attendance.js    POST /api/attendance
│   └─ teachers.js      GET /api/teachers
└─ backend/
    ├─ schema.sql        database tables
    └─ seed.mjs          generates seed.sql (structure + demo users)
```

---

## 1. Prerequisites

```bash
npm install -g wrangler      # Cloudflare CLI
wrangler login               # opens browser to authorize
```

## 2. Create the database

```bash
wrangler d1 create vrp-progress
```

Copy the printed `database_id` into **`wrangler.toml`** (replace
`PASTE-YOUR-D1-DATABASE-ID-HERE`).

## 3. Create tables + seed data

```bash
# tables
wrangler d1 execute vrp-progress --remote --file=backend/schema.sql

# generate + load structure, teachers, and demo users
node backend/seed.mjs > backend/seed.sql
wrangler d1 execute vrp-progress --remote --file=backend/seed.sql
```

> The seed creates demo logins — **change these passwords before going live**:
> `teacher/teacher123` · `parent/parent123` · `executive/executive123` · `academic/academic123`

## 4. Deploy

```bash
wrangler pages deploy . --project-name=vrp-progress
```

You get a live URL like `https://vrp-progress.pages.dev`. Functions in
`functions/api/**` are deployed automatically alongside the static site.

For automatic deploys on every push, connect the repo in the Cloudflare
dashboard (**Workers & Pages → Pages → Connect to Git**), framework preset
**None**, output dir `/`, and add the D1 binding under **Settings → Functions → D1 bindings**
(`DB` → `vrp-progress`).

---

## How the frontend switches to the database

`db.js` exposes `window.VRPApi`. On load it calls `VRPApi.probe()`:

- **Backend reachable** → `mode === "api"`: login + all reads/writes hit the
  D1 API. Data is shared across every device and user.
- **No backend** (local file / this preview) → `mode === "local"`: the app
  keeps using the built-in mock data persisted to `localStorage`, so the demo
  still works offline.

To move a dashboard onto the live database, replace its local `useState`
seeds with calls such as:

```js
const data = await VRPApi.get(`/grades?offering=${offeringId}`);
await VRPApi.post(`/grades`, { offeringId, studentId, collected, midterm, final, remark });
await VRPApi.post(`/attendance`, { enrollmentId, week, status });
const { offerings } = await VRPApi.get(`/offerings?semester=1/2569`);
await VRPApi.post(`/offerings`, draft);     // academic role
await VRPApi.put(`/offerings/${id}`, draft);
await VRPApi.del(`/offerings/${id}`);
```

The API enforces roles server-side: only `teacher` can write grades/attendance,
only `academic` can manage offerings, `parent` can read only their linked child.

---

## Cost & limits (free tier)

- D1: 5 GB storage, 5M row reads/day — far beyond a single college's needs.
- Pages: unlimited static requests, 100k Function invocations/day.
- Custom domain (e.g. `progress.vrp.ac.th`): free in Pages → Custom domains.

## Security checklist before production

- [ ] Change all demo passwords (`UPDATE users SET password_hash=...`)
- [ ] Set a strong session policy (tokens expire in 7 days by default)
- [ ] Restrict CORS / serve API same-origin (default here = same origin ✅)
- [ ] Enable Cloudflare Access or WAF rules if needed for staff-only areas
- [ ] Regular D1 backups: `wrangler d1 export vrp-progress --output=backup.sql`
