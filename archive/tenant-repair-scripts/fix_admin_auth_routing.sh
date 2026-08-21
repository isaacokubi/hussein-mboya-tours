#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_DIR="$PROJECT_ROOT/server"
INDEX="$SERVER_DIR/routes/index.js"

echo "============================================================"
echo "HUSSEIN MBOYA TOURS - ADMIN AUTH ROUTING FIX"
echo "============================================================"
echo "Project: $PROJECT_ROOT"
echo "Server:  $SERVER_DIR"
echo

if [[ ! -f "$INDEX" ]]; then
  echo "ERROR: routes/index.js not found:"
  echo "$INDEX"
  exit 1
fi

cd "$SERVER_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="$SERVER_DIR/.repair-backups/admin-auth-$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

echo "[1/7] Creating backup..."
cp routes/index.js "$BACKUP_DIR/index.js"
cp routes/adminAuthRoutes.js "$BACKUP_DIR/adminAuthRoutes.js"
cp controllers/adminAuthController.js "$BACKUP_DIR/adminAuthController.js"
cp middleware/tenantMiddleware.js "$BACKUP_DIR/tenantMiddleware.js"
cp middleware/authMiddleware.js "$BACKUP_DIR/authMiddleware.js"

echo "Backup created:"
echo "$BACKUP_DIR"
echo

echo "[2/7] Checking current route ordering..."

if grep -nF 'router.use("/admin/auth", adminAuthRoutes);' routes/index.js >/dev/null &&
   grep -nF 'router.use("/admin", adminRoutes);' routes/index.js >/dev/null; then
    echo "Admin auth and admin routes found."
else
    echo "ERROR: Expected admin routes were not found."
    echo
    grep -nE 'router\.use\("/admin' routes/index.js || true
    exit 1
fi

AUTH_LINE="$(grep -nF 'router.use("/admin/auth", adminAuthRoutes);' routes/index.js | head -1 | cut -d: -f1)"
ADMIN_LINE="$(grep -nF 'router.use("/admin", adminRoutes);' routes/index.js | head -1 | cut -d: -f1)"

echo "admin/auth line: $AUTH_LINE"
echo "admin line:      $ADMIN_LINE"

if [[ "$AUTH_LINE" -lt "$ADMIN_LINE" ]]; then
    echo "GOOD: admin/auth is already before /admin."
else
    echo "FIXING: /admin currently intercepts /admin/auth..."
    
    python3 - <<'PY'
from pathlib import Path

path = Path("routes/index.js")
text = path.read_text()

old = '''router.use("/tenants", tenantRoutes);
router.use("/admin/roles", adminRoleRoutes);
router.use("/admin", adminRoutes);
router.use("/admin/auth", adminAuthRoutes);
'''

new = '''router.use("/tenants", tenantRoutes);

/*
 * IMPORTANT:
 * Admin authentication must be registered before the protected
 * /admin router. Otherwise /admin/auth/login is intercepted by
 * adminRoutes -> protect -> 401 Authentication required.
 *
 * Tenant resolution still happens globally in app.js, so the login
 * remains tenant-aware and requires X-Tenant-ID, X-Tenant-Slug,
 * or a configured company domain.
 */
router.use("/admin/auth", adminAuthRoutes);

router.use("/admin/roles", adminRoleRoutes);
router.use("/admin", adminRoutes);
'''

if old not in text:
    raise SystemExit(
        "ERROR: Expected admin route block was not found exactly. "
        "No modification made."
    )

path.write_text(text.replace(old, new, 1))
print("Admin route ordering fixed.")
PY
fi

echo
echo "[3/7] Verifying admin authentication route..."

sed -n '80,105p' routes/index.js

echo
echo "[4/7] Verifying adminAuthRoutes.js does not use protect..."

if grep -nE 'protect|adminMiddleware|adminOnly|superAdminOnly' routes/adminAuthRoutes.js; then
    echo
    echo "WARNING: Authentication route contains protected middleware."
    echo "Review the output above."
else
    echo "GOOD: adminAuthRoutes.js contains no protect/admin middleware."
fi

echo
echo "[5/7] Syntax checking..."

node --check routes/index.js
node --check routes/adminAuthRoutes.js
node --check controllers/adminAuthController.js
node --check middleware/tenantMiddleware.js
node --check middleware/authMiddleware.js

echo "All changed/relevant JavaScript files passed syntax checks."

echo
echo "[6/7] Checking final route ordering..."

AUTH_LINE="$(grep -nF 'router.use("/admin/auth", adminAuthRoutes);' routes/index.js | head -1 | cut -d: -f1)"
ADMIN_LINE="$(grep -nF 'router.use("/admin", adminRoutes);' routes/index.js | head -1 | cut -d: -f1)"

if [[ -z "$AUTH_LINE" || -z "$ADMIN_LINE" ]]; then
    echo "ERROR: Could not locate final route positions."
    exit 1
fi

if [[ "$AUTH_LINE" -lt "$ADMIN_LINE" ]]; then
    echo "PASS: /admin/auth is registered before /admin."
else
    echo "FAIL: /admin/auth is still after /admin."
    exit 1
fi

echo
echo "[7/7] Showing git diff..."

git diff -- routes/index.js || true

echo
echo "============================================================"
echo "FIX COMPLETED SUCCESSFULLY"
echo "============================================================"
echo
echo "Backup:"
echo "  $BACKUP_DIR"
echo
echo "Next:"
echo "  1. Restart the backend."
echo "  2. Test POST /api/admin/auth/login."
echo "  3. Send X-Tenant-ID:"
echo "     6a87fe1bc3f48c3dcddf4a23"
echo
echo "Expected successful response:"
echo '  {"success":true,"token":"...","user":{...}}'
echo
echo "IMPORTANT:"
echo "The script did NOT change your admin password."
echo "The script did NOT modify tenant data."
echo "The script did NOT modify permissions."
echo "============================================================"
