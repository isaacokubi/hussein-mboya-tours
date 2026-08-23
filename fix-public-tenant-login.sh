#!/usr/bin/env bash

set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER="$ROOT/server"
CLIENT="$ROOT/client"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.repair-backups/public-tenant-login-$STAMP"

mkdir -p "$BACKUP"

echo
echo "============================================================"
echo " PUBLIC TENANT LOGIN REPAIR"
echo "============================================================"
echo
echo "Project: $ROOT"
echo "Backup:  $BACKUP"
echo

backup_file() {
  local file="$1"

  if [[ -f "$file" ]]; then
    local rel="${file#$ROOT/}"
    mkdir -p "$BACKUP/$(dirname "$rel")"
    cp "$file" "$BACKUP/$rel"
    echo "BACKUP: $rel"
  fi
}

die() {
  echo
  echo "ERROR: $1"
  echo
  echo "No further modifications will be made."
  exit 1
}

[[ -d "$SERVER" ]] || die "server directory not found"
[[ -d "$CLIENT" ]] || die "client directory not found"

AXIOS="$CLIENT/src/api/axios.js"
AUTH="$CLIENT/src/context/AuthContext.jsx"

[[ -f "$AXIOS" ]] || die "$AXIOS not found"
[[ -f "$AUTH" ]] || die "$AUTH not found"

echo "------------------------------------------------------------"
echo "STEP 1: LOCATE TENANT IMPLEMENTATION"
echo "------------------------------------------------------------"

TENANT_FILES=(
  "$SERVER/middleware/tenantMiddleware.js"
  "$SERVER/tenancy/context.js"
  "$SERVER/tenancy/bootstrap.js"
  "$SERVER/tenancy/tenantPlugin.js"
  "$SERVER/utils/tenantQuery.js"
)

for f in "${TENANT_FILES[@]}"; do
  if [[ -f "$f" ]]; then
    echo "FOUND: ${f#$ROOT/}"
  fi
done

echo
echo "Tenant-related code:"
grep -Rni \
  -E "Tenant context is required|tenantId|X-Tenant|x-tenant|tenantSlug|tenantKey" \
  "$SERVER/middleware" \
  "$SERVER/tenancy" \
  "$SERVER/routes/authRoutes.js" \
  "$SERVER/controllers/authController.js" \
  2>/dev/null | head -n 250 || true

echo
echo "------------------------------------------------------------"
echo "STEP 2: BACK UP TARGET FILES"
echo "------------------------------------------------------------"

backup_file "$AXIOS"
backup_file "$AUTH"

if [[ -f "$SERVER/middleware/tenantMiddleware.js" ]]; then
  backup_file "$SERVER/middleware/tenantMiddleware.js"
fi

if [[ -f "$SERVER/tenancy/context.js" ]]; then
  backup_file "$SERVER/tenancy/context.js"
fi

echo
echo "------------------------------------------------------------"
echo "STEP 3: VERIFY PUBLIC TENANT CONFIGURATION"
echo "------------------------------------------------------------"

ENV_FILE="$SERVER/.env"

if [[ -f "$ENV_FILE" ]]; then
  echo "Server .env found."

  PUBLIC_TENANT_LINES="$(
    grep -Ei \
      'TENANT|ORGANIZATION|COMPANY|PUBLIC' \
      "$ENV_FILE" \
      2>/dev/null || true
  )"

  if [[ -n "$PUBLIC_TENANT_LINES" ]]; then
    echo
    echo "Existing tenant/public configuration:"
    echo "$PUBLIC_TENANT_LINES" \
      | sed -E 's/(=.*)/=<configured>/'
  else
    echo "No tenant/public configuration found in server/.env."
  fi
else
  echo "WARNING: server/.env not found."
fi

echo
echo "------------------------------------------------------------"
echo "STEP 4: ADD SAFE PUBLIC TENANT ENVIRONMENT VARIABLES"
echo "------------------------------------------------------------"

ENV_EXAMPLE="$SERVER/.env.example"

if [[ -f "$ENV_EXAMPLE" ]]; then
  backup_file "$ENV_EXAMPLE"
fi

add_env_if_missing() {
  local file="$1"
  local key="$2"
  local value="$3"

  touch "$file"

  if ! grep -qE "^${key}=" "$file"; then
    printf '\n%s=%s\n' "$key" "$value" >> "$file"
    echo "ADDED: $key"
  else
    echo "EXISTS: $key"
  fi
}

if [[ -f "$ENV_FILE" ]]; then
  add_env_if_missing \
    "$ENV_FILE" \
    "PUBLIC_TENANT_KEY" \
    "global-tours"

  add_env_if_missing \
    "$ENV_FILE" \
    "PUBLIC_TENANT_SLUG" \
    "global-tours"
fi

if [[ -f "$ENV_EXAMPLE" ]]; then
  add_env_if_missing \
    "$ENV_EXAMPLE" \
    "PUBLIC_TENANT_KEY" \
    "global-tours"

  add_env_if_missing \
    "$ENV_EXAMPLE" \
    "PUBLIC_TENANT_SLUG" \
    "global-tours"
fi

echo
echo "IMPORTANT:"
echo "The values global-tours are defaults only."
echo "They must match the actual public tenant identifier in MongoDB."
echo

echo
echo "------------------------------------------------------------"
echo "STEP 5: PATCH AXIOS TENANT HEADER SAFELY"
echo "------------------------------------------------------------"

python3 - "$AXIOS" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()

original = text

# Do not duplicate the interceptor.
marker = "PUBLIC TENANT CONTEXT"

if marker not in text:
    addition = r'''

/* ============================================================
 * PUBLIC TENANT CONTEXT
 *
 * Public/customer requests need a tenant identifier so the
 * backend can resolve the company before tenant-scoped queries.
 *
 * SuperAdmin requests remain tenantless because the backend
 * recognizes the super_admin platform role separately.
 * ============================================================ */

const PUBLIC_TENANT_KEY =
  import.meta.env.VITE_PUBLIC_TENANT_KEY ||
  import.meta.env.VITE_PUBLIC_TENANT_SLUG ||
  "";

const getPublicTenantKey = () => {
  if (typeof window !== "undefined") {
    const stored =
      window.localStorage.getItem("tenantKey") ||
      window.localStorage.getItem("tenantSlug");

    if (stored) return stored;
  }

  return PUBLIC_TENANT_KEY;
};

'''

    # Insert after imports / before first axios instance.
    lines = text.splitlines(True)

    insert_at = 0

    for i, line in enumerate(lines):
        if line.startswith("import "):
            insert_at = i + 1
        elif insert_at and not line.startswith("import "):
            break

    lines.insert(insert_at, addition + "\n")
    text = "".join(lines)

# Find axios request interceptor.
if "config.headers" in text and "X-Tenant-Key" not in text:
    needle = "config.headers"

    idx = text.find(needle)

    if idx != -1:
        # Find the end of the statement/block containing config.headers.
        # Instead of rewriting existing interceptor logic, add a standalone
        # interceptor before the export.
        pass

if "X-Tenant-Key" not in text:
    interceptor = r'''

/* Resolve the public tenant before tenant-scoped API requests. */
axiosInstance.interceptors.request.use(
  (config) => {
    const tenantKey = getPublicTenantKey();

    if (tenantKey) {
      config.headers = config.headers || {};
      config.headers["X-Tenant-Key"] = tenantKey;

      /*
       * Compatibility with installations that use X-Tenant-ID.
       * This does not override an explicitly supplied tenant ID.
       */
      if (!config.headers["X-Tenant-ID"] && !config.headers["x-tenant-id"]) {
        config.headers["X-Tenant-ID"] = tenantKey;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* PUBLIC TENANT CONTEXT */
'''

    # Find export default / named export and insert immediately before it.
    export_positions = [
        text.find("export default axiosInstance"),
        text.find("export default api"),
        text.find("export { axiosInstance"),
    ]

    export_positions = [p for p in export_positions if p >= 0]

    if export_positions:
        pos = min(export_positions)
        text = text[:pos] + interceptor + "\n" + text[pos:]
    else:
        print("WARNING: Could not locate axios export.")
        print("Axios file was not automatically patched.")
        sys.exit(0)

if text != original:
    path.write_text(text)
    print(f"PATCHED: {path}")
else:
    print("NO CHANGE:", path)
PY

echo
echo "Axios patch completed."

echo
echo "------------------------------------------------------------"
echo "STEP 6: CREATE FRONTEND TENANT CONFIG"
echo "------------------------------------------------------------"

CLIENT_ENV="$CLIENT/.env.local"

if [[ -f "$CLIENT_ENV" ]]; then
  backup_file "$CLIENT_ENV"
else
  touch "$CLIENT_ENV"
fi

add_client_env_if_missing() {
  local key="$1"
  local value="$2"

  if ! grep -qE "^${key}=" "$CLIENT_ENV"; then
    printf '%s=%s\n' "$key" "$value" >> "$CLIENT_ENV"
    echo "ADDED: $key"
  else
    echo "EXISTS: $key"
  fi
}

add_client_env_if_missing "VITE_PUBLIC_TENANT_KEY" "global-tours"
add_client_env_if_missing "VITE_PUBLIC_TENANT_SLUG" "global-tours"

echo
echo "------------------------------------------------------------"
echo "STEP 7: VERIFY AUTH ROUTES"
echo "------------------------------------------------------------"

echo
echo "Auth routes:"
if [[ -f "$SERVER/routes/authRoutes.js" ]]; then
  sed -n '1,260p' "$SERVER/routes/authRoutes.js"
else
  echo "WARNING: authRoutes.js not found."
fi

echo
echo "Auth controller tenant handling:"
if [[ -f "$SERVER/controllers/authController.js" ]]; then
  grep -nE \
    "tenant|runWithTenant|superadmin|super_admin|login" \
    "$SERVER/controllers/authController.js" \
    | head -n 200 || true
fi

echo
echo "------------------------------------------------------------"
echo "STEP 8: JAVASCRIPT SYNTAX CHECK"
echo "------------------------------------------------------------"

if command -v node >/dev/null 2>&1; then
  node --check "$SERVER/middleware/tenantMiddleware.js" 2>/dev/null \
    && echo "PASS: tenantMiddleware.js" \
    || echo "WARNING: tenantMiddleware.js syntax check failed or file absent"

  node --check "$SERVER/controllers/authController.js" 2>/dev/null \
    && echo "PASS: authController.js" \
    || echo "WARNING: authController.js syntax check failed"

  node --check "$SERVER/routes/authRoutes.js" 2>/dev/null \
    && echo "PASS: authRoutes.js" \
    || echo "WARNING: authRoutes.js syntax check failed"
fi

echo
echo "------------------------------------------------------------"
echo "STEP 9: FRONTEND BUILD"
echo "------------------------------------------------------------"

cd "$CLIENT"

if npm run build; then
  echo
  echo "PASS: React/Vite production build"
else
  echo
  echo "FAIL: React/Vite production build"
  echo
  echo "Restore the Axios file with:"
  echo "cp \"$BACKUP/client/src/api/axios.js\" \"$AXIOS\""
  exit 1
fi

echo
echo "============================================================"
echo "REPAIR COMPLETED"
echo "============================================================"
echo
echo "Backup:"
echo "$BACKUP"
echo
echo "Next:"
echo "1. Restart the server."
echo "2. Restart Vite."
echo "3. Open http://localhost:5173/login"
echo "4. Test customer login."
echo "5. Test /superadmin/dashboard separately."
echo
echo "NOTE:"
echo "The public tenant identifier must correspond to an actual"
echo "tenant in MongoDB. The script does NOT modify tenant data."
echo
