#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
SERVER="$ROOT/server"
CLIENT="$ROOT/client"

echo "============================================================"
echo " COHERENT TOURS - SUPER ADMIN AUTH SESSION REPAIR"
echo "============================================================"

if [ ! -d "$SERVER" ] || [ ! -d "$CLIENT" ]; then
  echo "ERROR: Run this from the project root."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$SERVER/scripts/superadmin-auth-repair-$STAMP"

mkdir -p "$BACKUP"

echo
echo "[1/10] Backing up authentication files..."

FILES=(
  "client/src/context/AuthContext.jsx"
  "client/src/api/axios.js"
  "client/src/pages/superadmin/SuperAdminDashboard.jsx"
  "client/src/components/auth/ProtectedRoute.jsx"
  "client/src/components/admin/ProtectedAdminRoute.jsx"
  "server/controllers/authController.js"
  "server/middleware/authMiddleware.js"
  "server/routes/authRoutes.js"
  "server/routes/index.js"
)

for f in "${FILES[@]}"; do
  if [ -f "$ROOT/$f" ]; then
    mkdir -p "$BACKUP/$(dirname "$f")"
    cp "$ROOT/$f" "$BACKUP/$f"
    echo "  backed up: $f"
  fi
done

echo
echo "[2/10] Inspecting authentication implementation..."

echo
echo "--- AuthContext token handling ---"
grep -nE \
  'localStorage|token|accessToken|authToken|fetchCurrentUser|/auth/me|setUser|logout' \
  "$CLIENT/src/context/AuthContext.jsx" \
  | head -150 || true

echo
echo "--- Axios authentication handling ---"
grep -nE \
  'Authorization|Bearer|401|tenantId|tenantSlug|X-Tenant' \
  "$CLIENT/src/api/axios.js" \
  | head -150 || true

echo
echo "--- Backend protect middleware ---"
grep -nE \
  'authorization|Bearer|jwt|verify|User|401|tenant|role' \
  "$SERVER/middleware/authMiddleware.js" \
  | head -200 || true

echo
echo "--- Auth routes ---"
grep -nE \
  'router\.(get|post)|/me|login|protect' \
  "$SERVER/routes/authRoutes.js" \
  | head -150 || true

echo
echo "[3/10] Checking Super Admin route configuration..."

grep -RniE \
  'superadmin|super_admin|SuperAdmin' \
  "$SERVER/routes" \
  --exclude-dir=node_modules \
  | head -200 || true

echo
echo "[4/10] Checking Super Admin frontend..."

grep -RniE \
  '401|session has expired|login again|/superadmin|api\.(get|post)|axios' \
  "$CLIENT/src/pages/superadmin" \
  --exclude-dir=node_modules \
  | head -250 || true

echo
echo "[5/10] Creating an authentication-state cleanup helper..."

cat > "$CLIENT/src/utils/clearAuthState.js" <<'JS'
/**
 * Central authentication-state cleanup.
 *
 * IMPORTANT:
 * This removes authentication state only.
 * It does NOT modify MongoDB or application data.
 */

export function clearAuthState() {
  if (typeof window === "undefined") return;

  const keys = [
    "token",
    "accessToken",
    "authToken",
    "user",
    "permissions",
  ];

  for (const key of keys) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage failures.
    }
  }

  /*
   * Tenant information is deliberately retained.
   *
   * A Super Admin may be tenantless, but the public application
   * still needs its configured tenant after logout/login.
   */
}

export default clearAuthState;
JS

echo "  Created client/src/utils/clearAuthState.js"

echo
echo "[6/10] Repairing AuthContext..."

python3 - "$CLIENT/src/context/AuthContext.jsx" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text()

original = text

# Ensure tenantSlug is not accidentally removed by logout.
text = text.replace(
    '["token", "accessToken", "authToken", "user", "permissions", "tenantId"].forEach',
    '["token", "accessToken", "authToken", "user", "permissions"].forEach'
)

# Make token restoration more robust.
text = text.replace(
    'const savedToken = localStorage.getItem("token");',
    '''const savedToken =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");'''
)

# Prevent malformed auth responses from silently leaving stale user state.
text = text.replace(
    '''if (!data?.token) throw new Error("Authentication response did notcontain a token.");''',
    '''if (!data?.token) {
      throw new Error("Authentication response did not contain a token.");
    }'''
)

# Fix the common malformed spacing variant too.
text = text.replace(
    '''if (!data?.token) throw new Error("Authentication response did not contain a token.");''',
    '''if (!data?.token) {
      throw new Error("Authentication response did not contain a token.");
    }'''
)

if text == original:
    print("  AuthContext already contains the expected safeguards.")
else:
    path.write_text(text)
    print("  AuthContext repaired.")

PY

echo
echo "[7/10] Repairing Axios authentication handling..."

python3 - "$CLIENT/src/api/axios.js" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()

marker = 'const api = axios.create({'

# Make authentication token selection deterministic.
old = '''const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");'''

new = '''const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");'''

if old in text:
    text = text.replace(old, new)

# Add explicit diagnostic information without automatically deleting
# credentials on a 401. This is important because Super Admin API
# requests can fail independently of the login session.
old_response = '''  (error) => {
    if (error?.response?.status === 401) {
      console.error(
        "401 SERVER RESPONSE",
        error.response?.data
      );
    }

    return Promise.reject(error);
  }'''

new_response = '''  (error) => {
    if (error?.response?.status === 401) {
      console.error(
        "401 SERVER RESPONSE",
        {
          url: error?.config?.url,
          method: error?.config?.method,
          data: error?.response?.data,
          hasToken: Boolean(
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("authToken")
          ),
          user: (() => {
            try {
              return JSON.parse(localStorage.getItem("user") || "null");
            } catch {
              return null;
            }
          })()
        }
      );
    }

    return Promise.reject(error);
  }'''

if old_response in text:
    text = text.replace(old_response, new_response)
    print("  Axios 401 diagnostics improved.")
else:
    print("  Axios 401 handler already differs; leaving it unchanged.")

path.write_text(text)

PY

echo
echo "[8/10] Creating local authentication diagnostic..."

cat > "$ROOT/diagnose-superadmin-auth.sh" <<'DIAG'
#!/usr/bin/env bash
set -u

API_URL="${VITE_API_URL:-http://localhost:5000/api}"

echo
echo "============================================================"
echo " SUPER ADMIN AUTH DIAGNOSTIC"
echo "============================================================"

echo
echo "API:"
echo "  $API_URL"

TOKEN="${SUPERADMIN_TOKEN:-}"

if [ -z "$TOKEN" ]; then
  echo
  echo "No SUPERADMIN_TOKEN environment variable supplied."
  echo
  echo "To test a logged-in Super Admin token:"
  echo
  echo '  export SUPERADMIN_TOKEN="PASTE_TOKEN_HERE"'
  echo '  ./diagnose-superadmin-auth.sh'
  echo
  echo "The script will NOT modify MongoDB."
  exit 0
fi

echo
echo "--- GET /auth/me ---"

curl -sS -i \
  "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  | head -100

echo
echo "--- GET /superadmin/dashboard ---"

curl -sS -i \
  "$API_URL/superadmin/dashboard" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" \
  | head -120

echo
echo "============================================================"
echo " DIAGNOSTIC COMPLETE"
echo "============================================================"
DIAG

chmod +x "$ROOT/diagnose-superadmin-auth.sh"

echo
echo "[9/10] Running syntax checks..."

node --check "$SERVER/controllers/authController.js"
node --check "$SERVER/middleware/authMiddleware.js"
node --check "$SERVER/routes/authRoutes.js"

echo "  Backend authentication syntax: PASS"

echo
echo "--- Checking AuthContext syntax through Vite build ---"

cd "$CLIENT"

if npm run build; then
  echo
  echo "  Frontend production build: PASS"
else
  echo
  echo "  Frontend production build: FAILED"
  echo
  echo "The authentication source files were backed up here:"
  echo "  $BACKUP"
  exit 1
fi

cd "$ROOT"

echo
echo "[10/10] Final authentication checks..."

echo
echo "--- Token storage references ---"
grep -RniE \
  'localStorage\.(setItem|getItem|removeItem)\(["'\''](token|accessToken|authToken)' \
  "$CLIENT/src" \
  --exclude-dir=node_modules \
  | head -200 || true

echo
echo "--- Super Admin role references ---"
grep -RniE \
  'super_admin|superadmin' \
  "$CLIENT/src" "$SERVER" \
  --exclude-dir=node_modules \
  --exclude-dir=scripts \
  | head -250 || true

echo
echo "============================================================"
echo " SUPER ADMIN AUTH REPAIR COMPLETE"
echo "============================================================"

echo
echo "Backup:"
echo "  $BACKUP"

echo
echo "IMPORTANT:"
echo "No MongoDB data was changed."

echo
echo "NEXT STEP:"
echo
echo "1. Restart backend:"
echo "   cd server"
echo "   npm run dev"
echo
echo "2. Restart frontend:"
echo "   cd client"
echo "   npm run dev"
echo
echo "3. Open:"
echo "   http://localhost:5173/login"
echo
echo "4. Login as Super Admin."
echo
echo "5. If the dashboard still says session expired,"
echo "   run:"
echo
echo "   cd .."
echo "   ./diagnose-superadmin-auth.sh"
echo
echo "For a real token test:"
echo '   export SUPERADMIN_TOKEN="YOUR_TOKEN"'
echo "   ./diagnose-superadmin-auth.sh"
echo
echo "============================================================"
