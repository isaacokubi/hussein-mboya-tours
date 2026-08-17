#!/bin/bash

set -e

PROJECT="$HOME/Desktop/isaac projects/mern stack/hussein-mboya"

cd "$PROJECT"

echo "============================================================"
echo "FIXING MFA DEV PIN FLOW"
echo "============================================================"


echo "1. Inspecting MFA controller..."

python3 <<'PY'
from pathlib import Path

p=Path("server/controllers/mfaController.js")

text=p.read_text()

start=text.find("return res.status(200).json")

print(text[start:start+600])

PY


echo
echo "============================================================"
echo "PATCHING MFA CONTROLLER"
echo "============================================================"


python3 <<'PY'
from pathlib import Path

p=Path("server/controllers/mfaController.js")

text=p.read_text()


old='''return res.status(200).json({
      success: true,
      mfaRequired: true,
      userId: user._id,
      message: "A 4-digit verification PIN has been sent to your registered phone."
    });'''


new='''return res.status(200).json({
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
    });'''


if old in text:
    text=text.replace(old,new)
    p.write_text(text)
    print("MFA controller fixed")

elif "devPin:" in text:
    print("MFA controller already fixed")

else:
    print("Could not find block")
PY


echo
echo "============================================================"
echo "PATCHING LOGIN"
echo "============================================================"


python3 <<'PY'
from pathlib import Path

p=Path("client/src/pages/Login.jsx")

text=p.read_text()


if "devPin:" in text:
    print("Login already fixed")

else:

    text=text.replace(
'''userId: data.userId
''',
'''userId: data.userId,
                devPin: data.devPin
'''
    )

    p.write_text(text)

    print("Login fixed")

PY


echo
echo "============================================================"
echo "REMOVE BACKUP FILES FROM GIT"
echo "============================================================"


rm -rf mfa_backup

git rm -r --cached mfa_backup 2>/dev/null || true


echo
echo "============================================================"
echo "VERIFY"
echo "============================================================"


grep -R "devPin" \
server/controllers/mfaController.js \
client/src/pages/Login.jsx \
client/src/pages/CustomerMfa.jsx


echo
echo "============================================================"
echo "COMMIT PUSH"
echo "============================================================"


git add -A

git commit -m "Complete MFA development PIN delivery flow" || true

git push origin main


echo
echo "DONE"
