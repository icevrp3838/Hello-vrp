#!/usr/bin/env bash
# backend/deploy.sh — one-shot deploy of VRP Progress to Cloudflare Pages + D1.
#
# Run once from the repo root on a machine logged in to Cloudflare:
#   wrangler login          # (first time only)
#   bash backend/deploy.sh
#
# It is safe to re-run: it reuses an existing 'vrp-progress' D1 database and
# only re-seeds if you pass --seed.

set -euo pipefail
cd "$(dirname "$0")/.."   # repo root

DB_NAME="vrp-progress"
TOML="wrangler.toml"
RESEED="${1:-}"

command -v wrangler >/dev/null 2>&1 || { echo "→ installing wrangler..."; npm install -g wrangler; }

echo "==> 1/5  Ensuring D1 database '$DB_NAME' exists"
# Try to read an existing id; otherwise create it.
DB_ID="$(wrangler d1 info "$DB_NAME" 2>/dev/null | grep -ioE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1 || true)"
if [ -z "$DB_ID" ]; then
  CREATE_OUT="$(wrangler d1 create "$DB_NAME")"
  echo "$CREATE_OUT"
  DB_ID="$(echo "$CREATE_OUT" | grep -ioE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)"
fi
[ -n "$DB_ID" ] || { echo "✗ Could not determine database_id"; exit 1; }
echo "    database_id = $DB_ID"

echo "==> 2/5  Writing database_id into $TOML"
# Replace either the placeholder or a previously-written id.
sed -i.bak -E "s/database_id = \".*\"/database_id = \"$DB_ID\"/" "$TOML" && rm -f "$TOML.bak"

echo "==> 3/5  Creating tables (schema.sql)"
wrangler d1 execute "$DB_NAME" --remote --file=backend/schema.sql

echo "==> 4/5  Seeding data"
if [ "$RESEED" = "--seed" ] || ! wrangler d1 execute "$DB_NAME" --remote --command "SELECT 1 FROM users LIMIT 1;" >/dev/null 2>&1; then
  node backend/seed.mjs > backend/seed.sql
  wrangler d1 execute "$DB_NAME" --remote --file=backend/seed.sql
else
  echo "    users table already populated — skipping (pass --seed to force re-seed)"
fi

echo "==> 5/5  Deploying to Cloudflare Pages"
wrangler pages deploy . --project-name="$DB_NAME"

echo
echo "✓ Done. The D1 binding 'DB' is read from $TOML, so the API is live."
echo "  Demo logins: teacher/teacher123 · parent/parent123 · executive/executive123 · academic/academic123"
echo "  ⚠ Change these passwords before real use."
