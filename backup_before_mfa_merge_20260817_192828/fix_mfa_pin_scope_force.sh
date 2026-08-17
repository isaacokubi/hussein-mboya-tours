#!/bin/bash

set -e

echo "=========================================="
echo "FORCE FIX MFA PIN SCOPE"
echo "=========================================="

python3 <<'PY'
from pathlib import Path

p = Path("server/controllers/mfaController.js")

t = p.read_text()


# Replace challenge creation
t = t.replace(
    "await createCustomerLoginChallenge(user);",
    "const challenge = await createCustomerLoginChallenge(user);"
)


# Replace old undefined pin references inside response
t = t.replace(
    "? pin\n          : undefined,",
    "? challenge.pin\n          : undefined,"
)

t = t.replace(
    "? `Development PIN: ${pin}`",
    "? `Development PIN: ${challenge.pin}`"
)


p.write_text(t)

print("MFA controller updated")

PY


echo
echo "=========================================="
echo "CHECK RESULT"
echo "=========================================="

grep -n "challenge\|devPin\|Development PIN" server/controllers/mfaController.js


echo
echo "=========================================="
echo "NODE SYNTAX CHECK"
echo "=========================================="

cd server

node --check controllers/mfaController.js


echo
echo "=========================================="
echo "COMMIT"
echo "=========================================="

cd ..

git add server/controllers/mfaController.js

git commit -m "Fix MFA challenge PIN scope" || true

git push origin main


echo
echo "DONE"
