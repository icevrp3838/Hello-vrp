# backend/deploy.ps1 — one-shot deploy of VRP Progress to Cloudflare Pages + D1 (Windows).
#
# Run once from the repo root in PowerShell, on a machine logged in to Cloudflare:
#   wrangler login            # (first time only)
#   powershell -ExecutionPolicy Bypass -File backend\deploy.ps1
#
# Re-runnable: reuses an existing 'vrp-progress' D1 database and only re-seeds
# if you pass -Seed.

param([switch]$Seed)

$ErrorActionPreference = "Stop"
# repo root = parent of this script's folder
Set-Location (Split-Path $PSScriptRoot -Parent)

$DbName = "vrp-progress"
$Toml   = "wrangler.toml"
$GuidRe = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'

if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
  Write-Host "-> installing wrangler..."; npm install -g wrangler
}

Write-Host "==> 1/5  Ensuring D1 database '$DbName' exists"
$info = (wrangler d1 info $DbName 2>$null | Out-String)
$DbId = [regex]::Match($info, $GuidRe).Value
if (-not $DbId) {
  $created = (wrangler d1 create $DbName | Out-String)
  Write-Host $created
  $DbId = [regex]::Match($created, $GuidRe).Value
}
if (-not $DbId) { throw "Could not determine database_id" }
Write-Host "    database_id = $DbId"

Write-Host "==> 2/5  Writing database_id into $Toml"
(Get-Content $Toml -Raw) -replace 'database_id = ".*"', "database_id = `"$DbId`"" |
  Set-Content $Toml -NoNewline -Encoding utf8

Write-Host "==> 3/5  Creating tables (schema.sql)"
wrangler d1 execute $DbName --remote --file=backend/schema.sql

Write-Host "==> 4/5  Seeding data"
$hasUsers = $false
try { wrangler d1 execute $DbName --remote --command "SELECT 1 FROM users LIMIT 1;" 2>$null | Out-Null; $hasUsers = $? } catch {}
if ($Seed -or -not $hasUsers) {
  node backend/seed.mjs backend/seed.sql
  wrangler d1 execute $DbName --remote --file=backend/seed.sql
} else {
  Write-Host "    users table already populated — skipping (pass -Seed to force re-seed)"
}

Write-Host "==> 5/5  Deploying to Cloudflare Pages"
wrangler pages deploy . --project-name=$DbName

Write-Host ""
Write-Host "Done. The D1 binding 'DB' is read from $Toml, so the API is live."
Write-Host "Demo logins: teacher/teacher123 - parent/parent123 - executive/executive123 - academic/academic123"
Write-Host "Change these passwords before real use."
