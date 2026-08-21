#!/bin/bash

set -e

ROOT="$HOME/Desktop/isaac projects/mern stack/hussein-mboya"

SERVER="$ROOT/server"
CLIENT="$ROOT/client"

echo "========================================"
echo " FIX ADMIN DASHBOARD TENANT CONTEXT"
echo "========================================"


BACKUP="$ROOT/.repair-backups/admin-tenant-$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP"


echo "Backing up files..."

cp "$SERVER/controllers/authController.js" "$BACKUP/"
cp "$CLIENT/src/context/AuthContext.jsx" "$BACKUP/"
cp "$CLIENT/src/api/axios.js" "$BACKUP/"


####################################
# FIX AUTH ME BACKEND
####################################

echo "Updating authController.js"

cd "$SERVER"

python3 <<'PY'

from pathlib import Path

p=Path("controllers/authController.js")

s=p.read_text()


old='''const user = await User.findById(req.user._id)
    .populate("roleId");'''


new='''const user = await User.findById(req.user._id)
    .populate("roleId")
    .populate("tenantId");'''


if old in s:
    s=s.replace(old,new)
    print("tenant populate added")
else:
    print("tenant populate already exists")



old='''res.json({
    success:true,
    user
  });'''


new='''res.json({
    success:true,
    user:{
      ...user.toObject(),
      tenantId:user.tenantId?._id || null,
      tenantSlug:user.tenantId?.slug || null
    }
  });'''


if old in s:
    s=s.replace(old,new)
    print("auth me tenant response fixed")
else:
    print("auth me response already changed")


p.write_text(s)

PY



####################################
# FIX AUTH CONTEXT
####################################

echo "Updating AuthContext"


cd "$CLIENT"


python3 <<'PY'

from pathlib import Path

p=Path("src/context/AuthContext.jsx")

s=p.read_text()


needle='''localStorage.setItem("token", data.token);'''


replacement='''localStorage.setItem("token", data.token);

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


count=s.count(needle)

if count:
    s=s.replace(
        needle,
        replacement,
        1
    )
    print("login tenant storage fixed")
else:
    print("login storage already fixed")



p.write_text(s)

PY



####################################
# ADD AXIOS DEBUG
####################################


echo "Adding axios tenant debug"


python3 <<'PY'

from pathlib import Path

p=Path("src/api/axios.js")

s=p.read_text()


needle='''
api.interceptors.request.use((config) => {
'''


insert='''
api.interceptors.request.use((config) => {

console.log("TENANT API DEBUG",{
 url:config.url,
 tenantId:localStorage.getItem("tenantId"),
 tenantSlug:localStorage.getItem("tenantSlug"),
 token:localStorage.getItem("token") ? "YES":"NO"
});

'''


if "TENANT API DEBUG" not in s:
    s=s.replace(
        needle,
        insert
    )
    print("axios debug added")
else:
    print("axios debug already exists")


p.write_text(s)

PY



####################################

echo ""
echo "========================================"
echo " COMPLETE"
echo "========================================"

echo ""
echo "Restart backend:"
echo "cd server && npm run dev"

echo ""
echo "Restart frontend:"
echo "cd client && npm run dev"

echo ""
echo "Then browser console:"
echo "localStorage.clear()"

echo ""
echo "Login again."

echo ""
echo "Expected dashboard request:"
echo "X-Tenant-ID header present"
