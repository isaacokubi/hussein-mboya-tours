#!/bin/bash

set -e

echo "=========================================="
echo " FIX TENANT ENVIRONMENT CONFIGURATION"
echo "=========================================="

PROJECT_DIR="$HOME/Desktop/isaac projects/mern stack/hussein-mboya"
CLIENT="$PROJECT_DIR/client"

cd "$PROJECT_DIR"

echo ""
echo "===== BACKUP CURRENT FILES ====="

mkdir -p backups/tenant_env_fix_$(date +%Y%m%d_%H%M%S)

BACKUP="backups/tenant_env_fix_$(date +%Y%m%d_%H%M%S)"

cp client/src/api/axios.js "$BACKUP/axios.js" 2>/dev/null || true
cp client/.env "$BACKUP/.env" 2>/dev/null || true
cp client/.env.local "$BACKUP/.env.local" 2>/dev/null || true
cp client/.env.production "$BACKUP/.env.production" 2>/dev/null || true


echo ""
echo "===== FIX AXIOS CONFIG ====="

python3 <<'PY'
from pathlib import Path

p = Path("client/src/api/axios.js")

text = p.read_text()

old = '''const baseURL = isLocalBrowser && (!configuredApiUrl || isNgrokUrl) ? "http://localhost:5000/api" : configuredApiUrl || "/api";'''

new = '''const baseURL = configuredApiUrl || "/api";'''

if old in text:
    text=text.replace(old,new)
    print("Axios baseURL updated")
else:
    if 'const baseURL = configuredApiUrl || "/api";' in text:
        print("Axios already fixed")
    else:
        print("Axios line not found")

# protect tenant debug logging
old_debug='''console.log("TENANT API DEBUG",{'''
if old_debug in text:
    text=text.replace(
'''console.log("TENANT API DEBUG",{''',
'''if (import.meta.env.DEV) console.log("TENANT API DEBUG",{'''
    )
    print("Axios debug protected")

p.write_text(text)

PY


echo ""
echo "===== CREATE DEVELOPMENT ENV ====="

cat > client/.env.development.local <<'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
