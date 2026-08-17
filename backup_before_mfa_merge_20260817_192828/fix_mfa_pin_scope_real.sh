#!/bin/bash

set -e

echo "=========================================="
echo "FIXING MFA PIN SCOPE"
echo "=========================================="

python3 <<'PY'
from pathlib import Path

p = Path("server/controllers/mfaController.js")

t = p.read_text()

old = """
    await createCustomerLoginChallenge(user);

    return res.status(200).json({
      success: true,
      mfaRequired: true,
      userId: user._id,

      devPin:
        String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true"
          ? pin
          : undefined,

      message:
        String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true"
          ? `Development PIN: ${pin}`
          : "A 4-digit verification PIN has been sent to your registered phone."
    });
"""

new = """
    const challenge = await createCustomerLoginChallenge(user);

    return res.status(200).json({
      success: true,
      mfaRequired: true,
      userId: user._id,

      devPin:
        String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true"
          ? challenge.pin
          : undefined,

      message:
        String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true"
          ? `Development PIN: ${challenge.pin}`
          : "A 4-digit verification PIN has been sent to your registered phone."
    });
"""

if old not in t:
    print("OLD BLOCK NOT FOUND")
    print("Showing section:")
    
    start=t.find("await createCustomerLoginChallenge")
    print(t[start:start+600])
    exit(1)


t=t.replace(old,new)

p.write_text(t)

print("MFA PIN scope fixed")

PY


echo
echo "=========================================="
echo "SYNTAX CHECK"
echo "=========================================="

cd server

node --check controllers/mfaController.js


echo
echo "=========================================="
echo "COMMIT"
echo "=========================================="

cd ..

git add server/controllers/mfaController.js

git commit -m "Fix MFA PIN scope in customer login challenge" || true

git push origin main


echo
echo "DONE"
