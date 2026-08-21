#!/bin/bash

set -e

PROJECT="$HOME/Desktop/isaac projects/mern stack/hussein-mboya"

echo "======================================"
echo " TENANT ENV PRODUCTION FIX"
echo "======================================"

cd "$PROJECT"

BACKUP="backups/tenant_env_$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP"

echo "Backing up..."

cp client/src/api/axios.js "$BACKUP/" 2>/dev/null || true
cp client/.env* "$BACKUP/" 2>/dev/null || true


echo "Fixing axios..."

python3 <<'PY'
from pathlib import Path

p=Path("client/src/api/axios.js")

text=p.read_text()

text=text.replace(
'const baseURL = isLocalBrowser && (!configuredApiUrl || isNgrokUrl) ? "http://localhost:5000/api" : configuredApiUrl || "/api";',
'const baseURL = configuredApiUrl || "/api";'
)

p.write_text(text)

print("axios fixed")
PY


echo "Creating production env..."

cat > client/.env.production <<ENV
VITE_API_URL=https://hussein-mboya-tours.onrender.com/api
VITE_SOCKET_URL=https://hussein-mboya-tours.onrender.com
ENV


echo "Removing conflicting local env..."

rm -f client/.env.local


echo "Cleaning Vite..."

rm -rf client/dist
rm -rf client/node_modules/.vite


echo "Building..."

cd client

npm run build


echo "Checking localhost leaks..."

if grep -R "localhost:5000" dist >/dev/null 2>&1
then
    echo "ERROR: localhost detected"
    exit 1
else
    echo "OK: production build clean"
fi


echo ""
echo "======================================"
echo " TENANT FIX COMPLETE"
echo "======================================"
