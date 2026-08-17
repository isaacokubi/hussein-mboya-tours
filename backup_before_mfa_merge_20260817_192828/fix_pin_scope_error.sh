#!/bin/bash

set -e

echo "FIXING MFA PIN SCOPE ERROR"

python3 <<'PY'
from pathlib import Path

p = Path("server/controllers/mfaController.js")

t = p.read_text()


# Replace challenge creation block if needed
t = t.replace(
"""
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
""",
"""
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
)


p.write_text(t)

print("MFA controller fixed")

PY


echo
echo "CHECKING SYNTAX"

cd server

node --check controllers/mfaController.js

cd ..


echo
echo "COMMITTING"

git add server/controllers/mfaController.js

git commit -m "Fix MFA PIN variable scope error" || true

git push origin main


echo "DONE"
