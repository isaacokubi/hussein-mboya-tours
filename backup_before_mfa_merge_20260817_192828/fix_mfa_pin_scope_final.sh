#!/bin/bash

set -e

echo "=========================================="
echo "FIXING MFA PIN SCOPE FINAL"
echo "=========================================="

python3 <<'PY'
from pathlib import Path
import re

p = Path("server/controllers/mfaController.js")

t = p.read_text()


pattern = r"""
await createCustomerLoginChallenge\(user\);
\s*
return res\.status\(200\)\.json\(\{
\s*success: true,
\s*mfaRequired: true,
\s*userId: user\._id,

\s*devPin:
\s*String\(process\.env\.MFA_DEV_MODE \|\| ""\)\.toLowerCase\(\) === "true"
\s*\? pin
\s*: undefined,

\s*message:
\s*String\(process\.env\.MFA_DEV_MODE \|\| ""\)\.toLowerCase\(\) === "true"
\s*\? `Development PIN: \$\{pin\}`
\s*: "A 4-digit verification PIN has been sent to your registered phone\."
\s*\}\);
"""


replacement = """
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


new, count = re.subn(
    pattern,
    replacement,
    t,
    flags=re.MULTILINE
)


if count == 0:
    print("FAILED: MFA block not found")
    exit(1)


p.write_text(new)

print("SUCCESS: MFA PIN scope repaired")

PY


echo
echo "=========================================="
echo "VERIFY"
echo "=========================================="

grep -n "devPin\|challenge.pin" server/controllers/mfaController.js


echo
echo "=========================================="
echo "NODE CHECK"
echo "=========================================="

cd server

node --check controllers/mfaController.js


echo
echo "=========================================="
echo "COMMIT"
echo "=========================================="

cd ..

git add server/controllers/mfaController.js

git commit -m "Fix undefined MFA PIN variable" || true

git push origin main


echo
echo "DONE"
