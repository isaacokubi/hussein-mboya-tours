#!/usr/bin/env bash

set -Eeuo pipefail

ROOT="$(pwd)"
CLIENT="$ROOT/client/src"
SERVER="$ROOT/server"

echo
echo "============================================================"
echo " COHERENT TOURS - SUPER ADMIN AUTH FIX"
echo "============================================================"
echo

if [[ ! -d "$CLIENT" || ! -d "$SERVER" ]]; then
  echo "ERROR: Run this script from the repository root."
  echo "Expected: client/ and server/"
  exit 1
fi

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP="$ROOT/.auth-fix-backup-$STAMP"

mkdir -p "$BACKUP"

backup_file() {
  local file="$1"

  if [[ -f "$file" ]]; then
    local relative="${file#$ROOT/}"
    mkdir -p "$BACKUP/$(dirname "$relative")"
    cp -a "$file" "$BACKUP/$relative"
    echo "BACKUP: $relative"
  fi
}

echo "===== BACKING UP AUTH FILES ====="

backup_file "$CLIENT/context/AuthContext.jsx"
backup_file "$CLIENT/api/axios.js"
backup_file "$CLIENT/pages/superadmin/SuperAdminDashboard.jsx"
backup_file "$CLIENT/pages/Login.jsx"
backup_file "$CLIENT/routes/AppRoutes.jsx"
backup_file "$SERVER/middleware/authMiddleware.js"
backup_file "$SERVER/controllers/authController.js"
backup_file "$SERVER/routes/authRoutes.js"
backup_file "$SERVER/routes/superAdminRoutes.js"

echo
echo "Backup created:"
echo "  $BACKUP"
echo

###############################################################################
# 1. PATCH AXIOS AUTH HANDLING
###############################################################################

echo "===== PATCHING AXIOS AUTH HANDLING ====="

python3 - "$CLIENT/api/axios.js" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()

old = '''    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
'''

new = '''    /*
     * Canonical authentication token.
     *
     * The application stores the JWT under "token".
     * The legacy keys are retained only as compatibility fallbacks.
     */
    const token =
      localStorage.getItem("token")?.trim() ||
      localStorage.getItem("accessToken")?.trim() ||
      localStorage.getItem("authToken")?.trim();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["X-Requested-With"] = "XMLHttpRequest";
    }
'''

if old in text:
    text = text.replace(old, new)
    path.write_text(text)
    print("PATCHED axios token handling")
else:
    print("axios token block already differs; leaving it unchanged")
PY

###############################################################################
# 2. PATCH RESPONSE INTERCEPTOR
###############################################################################

echo "===== PATCHING AXIOS 401 HANDLING ====="

python3 - "$CLIENT/api/axios.js" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()

old = '''  (error) => {
    if (error?.response?.status === 401) {
      console.error(
        "401 SERVER RESPONSE",
        error.response?.data
      );
    }

    return Promise.reject(error);
  }
'''

new = '''  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const data = error?.response?.data;

    if (status === 401) {
      console.error("[AUTH 401]", {
        url,
        status,
        response: data,
        hasToken:
          typeof window !== "undefined"
            ? Boolean(
                localStorage.getItem("token") ||
                localStorage.getItem("accessToken") ||
                localStorage.getItem("authToken")
              )
            : false,
      });

      /*
       * IMPORTANT:
       * Do NOT automatically remove the JWT here.
       *
       * A dashboard request returning 401 must not silently destroy
       * the login session before AuthContext determines the cause.
       */
    }

    return Promise.reject(error);
  }
'''

if old in text:
    text = text.replace(old, new)
    path.write_text(text)
    print("PATCHED axios 401 handling")
else:
    print("Axios 401 handler already differs; leaving it unchanged")
PY

###############################################################################
# 3. PATCH AUTH CONTEXT
###############################################################################

echo "===== PATCHING AUTH CONTEXT ====="

python3 - "$CLIENT/context/AuthContext.jsx" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()

# Ensure token loading trims accidental whitespace.
text = text.replace(
    'localStorage.getItem("token")',
    'localStorage.getItem("token")?.trim()'
)

# Restore the canonical token whenever a successful login response contains it.
text = text.replace(
    'localStorage.setItem("token", data.token);',
    'localStorage.setItem("token", String(data.token).trim());'
)

# Protect against the malformed typo already visible in the repository.
text = text.replace(
    'Authentication response did notcontain a token.',
    'Authentication response did not contain a token.'
)

path.write_text(text)
print("PATCHED AuthContext token normalization")
PY

###############################################################################
# 4. REPLACE SUPER ADMIN DASHBOARD AUTH REQUEST WITH CENTRAL API CLIENT
###############################################################################

echo "===== AUDITING SUPER ADMIN DASHBOARD ====="

DASH="$CLIENT/pages/superadmin/SuperAdminDashboard.jsx"

if [[ ! -f "$DASH" ]]; then
  echo "ERROR: $DASH does not exist."
  exit 1
fi

grep -nE 'axios|fetch|api\.|/superadmin|401|session' "$DASH" || true

echo
echo "===== PATCHING SUPER ADMIN DASHBOARD ====="

python3 - "$DASH" <<'PY'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text()

# Remove direct axios imports when present.
text = re.sub(
    r'import\s+axios\s+from\s+["\']axios["\'];?\s*\n?',
    '',
    text
)

# Add canonical api import if absent.
if 'from "../../api/axios"' not in text:
    imports = re.findall(r'^import .*?;\s*$', text, re.M)

    if imports:
        last = imports[-1]
        text = text.replace(
            last,
            last + '\nimport api from "../../api/axios";'
        )
    else:
        text = 'import api from "../../api/axios";\n' + text

# Replace common direct axios calls with the authenticated api instance.
text = text.replace(
    'axios.get("/superadmin/dashboard")',
    'api.get("/superadmin/dashboard")'
)

text = text.replace(
    'axios.get(`/superadmin/dashboard`)',
    'api.get("/superadmin/dashboard")'
)

text = text.replace(
    'axios.get(`${API_URL}/superadmin/dashboard`)',
    'api.get("/superadmin/dashboard")'
)

# Replace fetch-based dashboard calls when they are simple endpoint calls.
text = re.sub(
    r'fetch\(\s*["\']/?api/?superadmin/dashboard["\']\s*\)',
    'api.get("/superadmin/dashboard")',
    text
)

path.write_text(text)

print("SuperAdminDashboard now uses the canonical api client where detectable.")
PY

###############################################################################
# 5. VERIFY SUPER ADMIN ROUTE
###############################################################################

echo
echo "===== SUPER ADMIN ROUTE ====="

sed -n '1,90p' "$SERVER/routes/superAdminRoutes.js"

###############################################################################
# 6. ADD AUTH DEBUG ENDPOINT
###############################################################################

echo
echo "===== ADDING AUTH DIAGNOSTIC ENDPOINT ====="

python3 - "$SERVER/routes/authRoutes.js" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()

if 'router.get("/auth-debug"' in text:
    print("Auth debug endpoint already exists")
    raise SystemExit

# Find protect import/use context.
marker = 'router.get("/me"'

if marker in text:
    block = r'''
/*
 * Development authentication diagnostic.
 *
 * This endpoint intentionally exposes only safe authentication metadata.
 * It never returns the JWT, password, refresh token, or secrets.
 */
router.get("/auth-debug", protect, (req, res) => {
  const role =
    typeof req.user?.role === "string"
      ? req.user.role
      : req.user?.role?.name;

  return res.status(200).json({
    success: true,
    authenticated: true,
    user: {
      id: req.user?._id || req.user?.id || null,
      name: req.user?.name || null,
      email: req.user?.email || null,
      role: role || null,
      tenantId:
        req.user?.tenantId?._id ||
        req.user?.tenantId ||
        null,
    },
    auth: {
      authorizationReceived: Boolean(req.headers.authorization),
    },
  });
});

'''
    text = text.replace(marker, block + marker)
    path.write_text(text)
    print("Added GET /auth/auth-debug")
else:
    print("Could not find /me route automatically; no endpoint added.")
PY

###############################################################################
# 7. CHECK AUTH MIDDLEWARE FOR JWT SECRET CONSISTENCY
###############################################################################

echo
echo "===== JWT CONFIGURATION AUDIT ====="

echo "--- authController JWT references ---"
grep -nEi 'jwt|JWT_SECRET|sign\(' \
  "$SERVER/controllers/authController.js" \
  2>/dev/null || true

echo
echo "--- authMiddleware JWT references ---"
grep -nEi 'jwt|JWT_SECRET|verify\(' \
  "$SERVER/middleware/authMiddleware.js" \
  2>/dev/null || true

echo
echo "--- Environment JWT variables ---"
if [[ -f "$SERVER/.env" ]]; then
  grep -nE '^[A-Za-z0-9_]*(JWT|TOKEN)[A-Za-z0-9_]*=' \
    "$SERVER/.env" \
    | sed 's/=.*$/=<configured>/g' \
    || true
else
  echo "server/.env not found"
fi

###############################################################################
# 8. STATIC CHECKS
###############################################################################

echo
echo "===== STATIC CHECKS ====="

echo "--- SuperAdminDashboard imports ---"
grep -nE '^import ' "$DASH" | head -30 || true

echo
echo "--- Remaining direct axios usage in SuperAdmin ---"
grep -RniE 'axios\.|fetch\(' \
  "$CLIENT/pages/superadmin" \
  --exclude-dir=node_modules \
  2>/dev/null || true

echo
echo "--- Token storage ---"
grep -RniE \
  'localStorage\.(getItem|setItem|removeItem).*token|Authorization.*Bearer' \
  "$CLIENT/context/AuthContext.jsx" \
  "$CLIENT/api/axios.js" \
  2>/dev/null || true

###############################################################################
# 9. FRONTEND BUILD
###############################################################################

echo
echo "===== FRONTEND BUILD CHECK ====="

if [[ -f "$ROOT/client/package.json" ]]; then
  (
    cd "$ROOT/client"

    if [[ -d node_modules ]]; then
      npm run build
    else
      echo "client/node_modules does not exist."
      echo "Run: cd client && npm install"
      exit 1
    fi
  )
else
  echo "client/package.json not found."
  exit 1
fi

###############################################################################
# 10. SERVER SYNTAX CHECK
###############################################################################

echo
echo "===== SERVER SYNTAX CHECK ====="

node --check "$SERVER/middleware/authMiddleware.js"
node --check "$SERVER/controllers/authController.js"
node --check "$SERVER/routes/authRoutes.js"
node --check "$SERVER/routes/superAdminRoutes.js"

echo
echo "============================================================"
echo " AUTH FIX COMPLETE"
echo "============================================================"
echo
echo "Backup:"
echo "  $BACKUP"
echo
echo "Next:"
echo "  1. Restart the backend."
echo "  2. Restart Vite."
echo "  3. Clear the browser's old token once."
echo "  4. Login again."
echo "  5. Open /superadmin/dashboard."
echo
echo "Browser console should now show [AUTH 401] details if"
echo "the backend still rejects the request."
echo
echo "Diagnostic endpoint:"
echo "  GET /api/auth/auth-debug"
echo
