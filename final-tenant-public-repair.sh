#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"

echo "============================================================"
echo " COHERENT TOURS - FINAL TENANT PUBLIC ACCESS REPAIR"
echo "============================================================"

TENANT_ID="6a87fe1bc3f48c3dcddf4a23"
TENANT_SLUG="hussein-mboya-tours"
API_URL="http://localhost:5000/api"
FRONTEND_URL="http://localhost:5173"

if [ ! -d "$ROOT/server" ] || [ ! -d "$ROOT/client" ]; then
  echo "ERROR: Run this from the project root."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/server/scripts/final-tenant-repair-$STAMP"
mkdir -p "$BACKUP"

echo
echo "[1/10] Backing up relevant files..."

FILES=(
  "server/app.js"
  "server/routes/index.js"
  "server/middleware/tenantMiddleware.js"
  "server/controllers/settingsController.js"
  "server/controllers/tenantBrandingController.js"
  "server/routes/tenantBrandingRoutes.js"
  "client/src/api/axios.js"
)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    mkdir -p "$BACKUP/$(dirname "$f")"
    cp "$f" "$BACKUP/$f"
    echo "  backed up: $f"
  fi
done

echo
echo "[2/10] Verifying MongoDB tenant..."

cd "$ROOT/server"

node --input-type=module <<'NODE'
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not configured.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection.db;

const tenant = await db.collection("organizations").findOne({
  slug: "hussein-mboya-tours",
  status: "active"
});

if (!tenant) {
  console.error("ERROR: Active Hussein Mboya Tours tenant was not found.");
  await mongoose.disconnect();
  process.exit(1);
}

console.log("Active tenant found:");

console.table([{
  id: String(tenant._id),
  name: tenant.name,
  slug: tenant.slug,
  status: tenant.status
}]);

await mongoose.disconnect();
NODE

cd "$ROOT"

echo
echo "[3/10] Configuring client/.env..."

ENV_FILE="$ROOT/client/.env"
touch "$ENV_FILE"

python3 - "$ENV_FILE" <<'PY2'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text() if path.exists() else ""

values = {
    "VITE_TENANT_ID": "6a87fe1bc3f48c3dcddf4a23",
    "VITE_TENANT_KEY": "hussein-mboya-tours",
    "VITE_TENANT_SLUG": "hussein-mboya-tours",
    "VITE_API_URL": "http://localhost:5000/api",
    "VITE_SOCKET_URL": "http://localhost:5000",
}

for key, value in values.items():
    pattern = rf"(?m)^{re.escape(key)}=.*$"
    line = f"{key}={value}"

    if re.search(pattern, text):
        text = re.sub(pattern, line, text)
    else:
        if text and not text.endswith("\n"):
            text += "\n"
        text += line + "\n"

path.write_text(text)

print("client/.env updated successfully.")
PY2

echo
echo "Tenant environment:"
grep -E '^VITE_(TENANT|API|SOCKET)' "$ENV_FILE" || true

echo
echo "[4/10] Verifying CORS..."

grep -n "X-Tenant-Key" "$ROOT/server/app.js" || true
grep -n "X-Tenant-ID" "$ROOT/server/app.js" || true
grep -n "X-Tenant-Slug" "$ROOT/server/app.js" || true

echo
echo "[5/10] Verifying tenant middleware..."

grep -nE \
  'X-Tenant-Key|X-Tenant-ID|X-Tenant-Slug|requestedTenantKey|requestedTenantSlug' \
  "$ROOT/server/middleware/tenantMiddleware.js" || true

echo
echo "[6/10] Verifying branding route..."

if [ ! -f "$ROOT/server/routes/tenantBrandingRoutes.js" ]; then
  echo "ERROR: tenantBrandingRoutes.js does not exist."
  exit 1
fi

grep -nE \
  'router\.use|router\.get|router\.put|export default' \
  "$ROOT/server/routes/tenantBrandingRoutes.js" || true

echo
echo "[7/10] Verifying route registration..."

grep -nE \
  'tenantBrandingRoutes|settings/public|/tenant' \
  "$ROOT/server/routes/index.js" || true

echo
echo "[8/10] Syntax checks..."

node --check server/app.js
node --check server/routes/index.js
node --check server/middleware/tenantMiddleware.js
node --check server/controllers/settingsController.js
node --check server/controllers/tenantBrandingController.js
node --check server/routes/tenantBrandingRoutes.js

echo "Backend syntax checks PASSED."

echo
echo "[9/10] Testing endpoints..."

echo
echo "--- OPTIONS /settings/public ---"

curl -i -X OPTIONS \
  "$API_URL/settings/public" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: x-tenant-key" \
  2>/dev/null | head -40 || true

echo
echo "--- GET /settings/public ---"

curl -i \
  "$API_URL/settings/public" \
  -H "Origin: $FRONTEND_URL" \
  -H "X-Tenant-Key: $TENANT_SLUG" \
  -H "Accept: application/json" \
  2>/dev/null | head -80 || true

echo
echo "--- GET /tenant/branding ---"

curl -i \
  "$API_URL/tenant/branding" \
  -H "Origin: $FRONTEND_URL" \
  -H "X-Tenant-Key: $TENANT_SLUG" \
  -H "Accept: application/json" \
  2>/dev/null | head -80 || true

echo
echo "[10/10] Frontend tenant references..."

grep -RniE \
  'VITE_TENANT|X-Tenant-Key|X-Tenant-Slug|X-Tenant-ID|tenantKey|tenantSlug' \
  "$ROOT/client/src" \
  --exclude-dir=node_modules \
  --exclude='*.backup' \
  --exclude='*.before-*' \
  | head -150 || true

echo
echo "============================================================"
echo " VERIFICATION COMPLETE"
echo "============================================================"

echo
echo "Tenant:"
echo "  ID:   $TENANT_ID"
echo "  Slug: $TENANT_SLUG"

echo
echo "Backup:"
echo "  $BACKUP"

echo
echo "Interpretation:"
echo "  200  = endpoint working"
echo "  404  = route mounting problem"
echo "  500  = controller/database/tenant resolution problem"
echo "  CORS = CORS configuration problem"

echo
echo "IMPORTANT:"
echo "Restart BOTH backend and frontend after this verification."

echo
echo "Backend:"
echo "  cd server"
echo "  npm run dev"

echo
echo "Frontend:"
echo "  cd client"
echo "  npm run dev"

echo
echo "Then hard-refresh:"
echo "  Ctrl + Shift + R"

echo
echo "Do NOT modify MongoDB data yet."
