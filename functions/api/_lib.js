// functions/api/_lib.js — shared helpers for all API routes

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });

export const bad = (msg, status = 400) => json({ error: msg }, status);

// ---- password hashing (PBKDF2 via WebCrypto) ----
export async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex
    ? hexToBytes(saltHex)
    : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256);
  return bytesToHex(salt) + ":" + bytesToHex(new Uint8Array(bits));
}
export async function verifyPassword(password, stored) {
  const [saltHex] = stored.split(":");
  const recomputed = await hashPassword(password, saltHex);
  return timingSafeEqual(recomputed, stored);
}

// ---- session tokens ----
export async function createSession(db, userId) {
  const token = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
  const expires = new Date(Date.now() + 7 * 864e5).toISOString();
  await db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)")
    .bind(token, userId, expires).run();
  return token;
}
export async function getUser(context) {
  const auth = context.request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const row = await context.env.DB.prepare(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > datetime('now')`).bind(token).first();
  return row || null;
}
// Guard: require a logged-in user, optionally with a specific role.
export async function requireRole(context, roles) {
  const user = await getUser(context);
  if (!user) return { error: json({ error: "unauthorized" }, 401) };
  if (roles && !roles.includes(user.role)) return { error: json({ error: "forbidden" }, 403) };
  return { user };
}

// ---- utils ----
function hexToBytes(hex) {
  const a = new Uint8Array(hex.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16);
  return a;
}
function bytesToHex(bytes) {
  return [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
export const uid = (p = "") => p + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
