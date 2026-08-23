#!/usr/bin/env bash

set -u

ROOT="$(pwd)"
SERVER="$ROOT/server"
CLIENT="$ROOT/client"

echo "============================================================"
echo " COHERENT TOURS - FINAL TENANT/PUBLIC API VERIFICATION"
echo "============================================================"

if [ ! -d "$SERVER" ]; then
  echo "ERROR: server directory not found."
  exit 1
fi

echo
echo "[1/10] Checking backend CORS configuration..."

grep -n -A3 -B2 "allowedHeaders" "$SERVER/app.js" || true

echo
echo "[2/10] Checking tenant route mount..."

grep -n -E 'tenantBrandingRoutes|router\.use\("/tenant"' \
  "$SERVER/routes/index.js" || true

echo
echo "[3/10] Cleaning duplicate semicolon if present..."

python3 - "$SERVER/routes/index.js" <<'PY'
from pathlib import Path

p = Path("server/routes/index.js")
text = p.read_text()

text = text.replace(
    'router.use("/tenant", tenantBrandingRoutes);;',
    'router.use("/tenant", tenantBrandingRoutes);'
)

p.write_text(text)

print("  routes/index.js cleaned.")
PY

echo
echo "[4/10] Inspecting tenant middleware..."

sed -n '1,180p' "$SERVER/middleware/tenantMiddleware.js"

echo
echo "[5/10] Inspecting branding controller..."

sed -n '1,220p' "$SERVER/controllers/tenantBrandingController.js"

echo
echo "[6/10] Inspecting public settings controller..."

sed -n '1,180p' "$SERVER/controllers/settingsController.js"

echo
echo "[7/10] Inspecting frontend tenant configuration..."

echo "--- axios.js tenant configuration ---"

grep -n -E \
  'X-Tenant-Key|X-Tenant-Slug|X-Tenant-ID|VITE_TENANT|publicTenant' \
  "$CLIENT/src/api/axios.js" \
  2>/dev/null || true

echo
echo "--- TenantContext ---"

sed -n '1,160p' "$CLIENT/src/context/TenantContext.jsx" \
  2>/dev/null || true

echo
echo "--- SettingsContext ---"

sed -n '1,160p' "$CLIENT/src/context/SettingsContext.jsx" \
  2>/dev/null || true

echo
echo "[8/10] Syntax checking backend..."

node --check "$SERVER/app.js"
node --check "$SERVER/routes/index.js"
node --check "$SERVER/routes/tenantBrandingRoutes.js"
node --check "$SERVER/middleware/tenantMiddleware.js"
node --check "$SERVER/controllers/tenantBrandingController.js"
node --check "$SERVER/controllers/settingsController.js"

echo "  Backend syntax OK."

echo
echo "[9/10] Checking active organization..."

cd "$SERVER"

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

const organizations = await db
  .collection("organizations")
  .find({})
  .project({
    _id: 1,
    name: 1,
    slug: 1,
    status: 1
  })
  .toArray();

console.table(
  organizations.map((o) => ({
    id: String(o._id),
    name: o.name,
    slug: o.slug,
    status: o.status
  }))
);

const active = organizations.filter(
  (o) => String(o.status).toLowerCase() === "active"
);

if (!active.length) {
  console.error("ERROR: No active organization found.");
  process.exitCode = 1;
} else {
  console.log("");
  console.log("ACTIVE TENANT:");
  console.log("  ID   :", String(active[0]._id));
  console.log("  NAME :", active[0].name);
  console.log("  SLUG :", active[0].slug);
}

await mongoose.disconnect();
NODE

echo
echo "[10/10] Testing API endpoints..."

cd "$ROOT"

echo
echo "------------------------------------------------------------"
echo "OPTIONS /api/settings/public"
echo "------------------------------------------------------------"

curl -i -X OPTIONS \
  "http://localhost:5000/api/settings/public" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: x-tenant-key" \
  --max-time 10 \
  || true

echo
echo "------------------------------------------------------------"
echo "GET /api/settings/public"
echo "------------------------------------------------------------"

curl -i \
  "http://localhost:5000/api/settings/public?_t=$(date +%s)" \
  -H "Origin: http://localhost:5173" \
  -H "X-Tenant-Key: hussein-mboya-tours" \
  --max-time 10 \
  || true

echo
echo "------------------------------------------------------------"
echo "GET /api/tenant/branding"
echo "------------------------------------------------------------"

curl -i \
  "http://localhost:5000/api/tenant/branding" \
  -H "Origin: http://localhost:5173" \
  -H "X-Tenant-Key: hussein-mboya-tours" \
  --max-time 10 \
  || true

echo
echo "============================================================"
echo " VERIFICATION COMPLETE"
echo "============================================================"

echo
echo "IMPORTANT:"
echo "If the endpoint tests show:"
echo
echo "  200 -> endpoint is working."
echo "  404 -> route/controller mounting problem remains."
echo "  500 -> controller/database/tenant-resolution problem remains."
echo "  CORS error -> app.js CORS configuration remains incorrect."
echo
echo "Do NOT change MongoDB data yet."
