#!/usr/bin/env bash
set -e

FILE="controllers/adminAuthController.js"

echo "Backing up $FILE"

cp "$FILE" "$FILE.backup.$(date +%Y%m%d_%H%M%S)"

python3 <<'PY'
from pathlib import Path

path = Path("controllers/adminAuthController.js")

text = path.read_text()

old = '''    const token = generateToken({
      _id: user._id,
      roleId: user.roleId,
      role,
      email: user.email,
      permissions,
    });'''

new = '''    const token = generateToken({
      _id: user._id,
      roleId: user.roleId,
      role,
      email: user.email,
      permissions,
      tenantId: user.tenantId,
    });'''

if old not in text:
    raise SystemExit("Target block not found")

path.write_text(text.replace(old, new))

print("Admin login JWT tenant claim fixed.")
PY

node --check controllers/adminAuthController.js

echo
echo "DONE"
echo "Restart backend and login again."
