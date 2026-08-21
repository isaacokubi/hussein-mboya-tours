#!/bin/bash

set -e

ROOT="$HOME/Desktop/isaac projects/mern stack/hussein-mboya"

SERVER="$ROOT/server"
CLIENT="$ROOT/client"

echo "======================================"
echo " FIX MULTITENANT AUTH LOGIN"
echo "======================================"

cd "$SERVER"


echo "1. Backup files"

mkdir -p .repair-backups/multitenant-login-$(date +%Y%m%d_%H%M%S)

BACKUP=".repair-backups/multitenant-login-$(date +%Y%m%d_%H%M%S)"

cp controllers/authController.js "$BACKUP/"
cp "$CLIENT/src/context/AuthContext.jsx" "$BACKUP/"


echo "2. Updating authController.js"


python3 <<'PY'

from pathlib import Path

p=Path("controllers/authController.js")

s=p.read_text()


# add populate tenant

old='''
const user = await User.findOne({
        email,
        tenantId: req.tenantId
      })
      .select("+password")'''


new='''
const user = await User.findOne({
        email,
        tenantId: req.tenantId
      })
      .populate("tenantId")
      .select("+password")'''


if old in s:
    s=s.replace(old,new)
    print("Added tenant populate")
else:
    print("tenant populate already exists")


# add tenantSlug response

old='''
tenantId:user.tenantId || null,

permissions,'''


new='''
tenantId:user.tenantId?._id || user.tenantId || null,

tenantSlug:user.tenantId?.slug || null,

permissions,'''


if old in s:
    s=s.replace(old,new)
    print("Added tenantSlug response")
else:
    print("tenant response already patched")


p.write_text(s)

PY



echo "3. Updating AuthContext.jsx"

cd "$CLIENT"


python3 <<'PY'

from pathlib import Path

p=Path("src/context/AuthContext.jsx")

s=p.read_text()


old='''
localStorage.setItem("token", data.token);'''


new='''
localStorage.setItem("token", data.token);

if(data.user?.tenantId){
  localStorage.setItem(
    "tenantId",
    data.user.tenantId
  );
}

if(data.user?.tenantSlug){
  localStorage.setItem(
    "tenantSlug",
    data.user.tenantSlug
  );
}'''


if old in s:
    s=s.replace(old,new)
    print("AuthContext tenant storage added")
else:
    print("AuthContext already patched")


p.write_text(s)

PY



echo "4. Clearing old browser auth data instructions"

echo ""
echo "======================================"
echo " FIX COMPLETE"
echo "======================================"

echo ""
echo "Restart backend:"
echo "cd server && npm run dev"

echo ""
echo "Restart frontend:"
echo "cd client && npm run dev"

echo ""
echo "After restart browser console:"
echo "localStorage.clear()"
echo "Then login again."

echo ""
echo "Expected headers:"
echo "Authorization: Bearer TOKEN"
echo "X-Tenant-ID: COMPANY_ID"
echo "======================================"
