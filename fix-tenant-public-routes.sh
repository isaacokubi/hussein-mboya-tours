#!/usr/bin/env bash

set -e

ROOT="$(pwd)"

echo "============================================================"
echo " COHERENT TOURS - TENANT/PUBLIC ROUTE REPAIR"
echo "============================================================"

if [ ! -d "$ROOT/server" ]; then
  echo "ERROR: server directory not found."
  exit 1
fi

if [ ! -d "$ROOT/client" ]; then
  echo "ERROR: client directory not found."
  exit 1
fi

timestamp="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/server/scripts/tenant-public-fix-backup-$timestamp"

mkdir -p "$BACKUP"

echo
echo "[1/8] Creating backups..."

for file in \
  server/middleware/tenantMiddleware.js \
  server/routes/index.js \
  server/routes/tenantBrandingRoutes.js \
  server/controllers/tenantBrandingController.js
do
  if [ -f "$file" ]; then
    mkdir -p "$BACKUP/$(dirname "$file")"
    cp "$file" "$BACKUP/$file"
    echo "  backed up: $file"
  fi
done

echo
echo "[2/8] Checking tenant middleware..."

TENANT_MW="server/middleware/tenantMiddleware.js"

if [ ! -f "$TENANT_MW" ]; then
  echo "ERROR: $TENANT_MW does not exist."
  exit 1
fi

python3 - "$TENANT_MW" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text()

original = text

# ------------------------------------------------------------
# Add X-Tenant-Key resolution.
# ------------------------------------------------------------

old = '''const requestedTenantSlug = String(req.get("X-Tenant-Slug") || "").trim().toLowerCase();'''

new = '''const requestedTenantSlug = String(req.get("X-Tenant-Slug") || "").trim().toLowerCase();
    const requestedTenantKey = String(req.get("X-Tenant-Key") || "").trim();'''

if old in text and "requestedTenantKey" not in text:
    text = text.replace(old, new)

# ------------------------------------------------------------
# Replace the existing requestedTenantSlug lookup block with
# a compatible tenant-key resolver when possible.
# ------------------------------------------------------------

old_block = '''if (!tenant && requestedTenantSlug) {
      tenant = await Organization.findOne({ slug: requestedTenantSlug, status: activeStatuses });
    }'''

new_block = '''if (!tenant && requestedTenantSlug) {
      tenant = await Organization.findOne({
        slug: requestedTenantSlug,
        status: activeStatuses
      });
    }

    /*
     * X-Tenant-Key compatibility:
     *
     * The frontend may send either:
     *   - tenant slug
     *   - MongoDB ObjectId
     *
     * Never trust the value blindly. Resolve it against the
     * Organization collection and require an active tenant.
     */
    if (!tenant && requestedTenantKey) {
      if (/^[a-fA-F0-9]{24}$/.test(requestedTenantKey)) {
        tenant = await Organization.findOne({
          _id: requestedTenantKey,
          status: activeStatuses
        });
      }

      if (!tenant) {
        tenant = await Organization.findOne({
          slug: requestedTenantKey.toLowerCase(),
          status: activeStatuses
        });
      }
    }'''

if old_block in text and "X-Tenant-Key compatibility" not in text:
    text = text.replace(old_block, new_block)

if text != original:
    path.write_text(text)
    print("  tenantMiddleware.js updated.")
else:
    print("  tenantMiddleware.js already contains compatible logic or could not be safely changed.")
PY

echo
echo "[3/8] Inspecting tenant branding route..."

BRANDING_ROUTE="server/routes/tenantBrandingRoutes.js"

if [ -f "$BRANDING_ROUTE" ]; then
  echo "  Found $BRANDING_ROUTE"
  sed -n '1,180p' "$BRANDING_ROUTE"
else
  echo "  WARNING: tenantBrandingRoutes.js not found."
fi

echo
echo "[4/8] Ensuring tenant branding route is mounted..."

INDEX="server/routes/index.js"

if [ ! -f "$INDEX" ]; then
  echo "ERROR: $INDEX not found."
  exit 1
fi

python3 - "$INDEX" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text()

route_file = Path("server/routes/tenantBrandingRoutes.js")

if not route_file.exists():
    print("  No tenantBrandingRoutes.js found; skipping mount.")
    raise SystemExit(0)

# ------------------------------------------------------------
# Detect whether route is already mounted.
# ------------------------------------------------------------

mount_patterns = [
    r'["\']/?tenant/branding["\']',
    r'["\']/?tenantBranding["\']',
    r'\btenantBrandingRoutes\b'
]

if any(re.search(p, text) for p in mount_patterns):
    print("  Tenant branding route appears to already be mounted.")
    raise SystemExit(0)

# ------------------------------------------------------------
# Detect import style.
# ------------------------------------------------------------

import_line = None

if re.search(
    r'import\s+tenantBrandingRoutes\s+from\s+["\']\.\/tenantBrandingRoutes\.js["\']',
    text
):
    import_line = None
else:
    # Insert import after the last top-level import.
    imports = list(re.finditer(
        r'^import .*?;\s*$',
        text,
        re.MULTILINE
    ))

    if imports:
        last = imports[-1]
        import_line = '\nimport tenantBrandingRoutes from "./tenantBrandingRoutes.js";'
        text = text[:last.end()] + import_line + text[last.end():]
    else:
        text = 'import tenantBrandingRoutes from "./tenantBrandingRoutes.js";\n' + text

# ------------------------------------------------------------
# Find router variable.
# ------------------------------------------------------------

router_match = re.search(
    r'const\s+(router)\s*=\s*(?:express\.)?Router\s*\(\s*\)',
    text
)

if not router_match:
    router_match = re.search(
        r'const\s+(router)\s*=\s*Router\s*\(\s*\)',
        text
    )

if not router_match:
    print("  ERROR: Could not identify router variable in routes/index.js")
    raise SystemExit(1)

router_name = router_match.group(1)

# ------------------------------------------------------------
# Add route mount.
# ------------------------------------------------------------

mount = f'\n\n{router_name}.use("/tenant", tenantBrandingRoutes);'

# Insert immediately after router declaration.
insert_pos = router_match.end()

text = text[:insert_pos] + mount + text[insert_pos:]

path.write_text(text)

print('  Added: router.use("/tenant", tenantBrandingRoutes);')
PY

echo
echo "[5/8] Checking whether the branding route exports a router..."

if [ -f "$BRANDING_ROUTE" ]; then

  if grep -qE 'export default router|export default[[:space:]]+.*router' "$BRANDING_ROUTE"; then
    echo "  Branding route has a default export."
  else
    echo "  WARNING: Branding route may not have a default router export."
    echo
    echo "  Current exports:"
    grep -nE 'export ' "$BRANDING_ROUTE" || true
  fi

fi

echo
echo "[6/8] Checking public settings route..."

grep -RniE 'settings/public|router.*settings|public.*settings' \
  server/routes server/controllers \
  --exclude-dir=node_modules || true

echo
echo "[7/8] Syntax checking modified backend files..."

node --check server/middleware/tenantMiddleware.js

node --check server/routes/index.js

if [ -f server/routes/tenantBrandingRoutes.js ]; then
  node --check server/routes/tenantBrandingRoutes.js
fi

echo "  Syntax checks passed."

echo
echo "[8/8] Searching for remaining Axios/tenant problems..."

echo
echo "--- axiosInstance references ---"
grep -Rni "axiosInstance" client/src \
  --exclude-dir=node_modules || true

echo
echo "--- tenant header references ---"
grep -RniE 'X-Tenant-Key|X-Tenant-Slug|X-Tenant-ID' \
  client/src server \
  --exclude-dir=node_modules \
  --exclude-dir=scripts | head -100 || true

echo
echo "--- branding route mounts ---"
grep -RniE 'tenantBrandingRoutes|/tenant' \
  server/routes/index.js \
  --exclude-dir=node_modules || true

echo
echo "============================================================"
echo " REPAIR COMPLETE"
echo "============================================================"
echo
echo "Backup:"
echo "  $BACKUP"
echo
echo "Next:"
echo "  1. Restart backend"
echo "  2. Run frontend"
echo "  3. Refresh browser"
echo
