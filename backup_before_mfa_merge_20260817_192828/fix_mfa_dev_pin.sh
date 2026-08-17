#!/bin/bash

set -e

PROJECT="$HOME/Desktop/isaac projects/mern stack/hussein-mboya"

SERVER="$PROJECT/server"
CLIENT="$PROJECT/client"

echo "============================================================"
echo "HUSSEIN MBOYA TOURS - MFA DEV PIN PATCH"
echo "============================================================"

cd "$PROJECT"

echo "Creating backup..."

mkdir -p "$PROJECT/mfa_backup"

cp "$SERVER/controllers/mfaController.js" \
"$PROJECT/mfa_backup/mfaController.js"

cp "$CLIENT/src/pages/Login.jsx" \
"$PROJECT/mfa_backup/Login.jsx"

cp "$CLIENT/src/pages/CustomerMfa.jsx" \
"$PROJECT/mfa_backup/CustomerMfa.jsx"


echo "============================================================"
echo "1. PATCHING MFA CONTROLLER"
echo "============================================================"

python3 <<'PY'
from pathlib import Path

path = Path(
"server/controllers/mfaController.js"
)

text = path.read_text()

old = '''return res.status(200).json({
      success: true,
      mfaRequired: true,
      userId: user._id,
      message: "A 4-digit verification PIN has been sent to your registered phone."
    });'''

new = '''return res.status(200).json({
      success: true,
      mfaRequired: true,
      userId: user._id,

      devPin:
        String(process.env.MFA_DEV_MODE).toLowerCase() === "true"
          ? pin
          : undefined,

      message:
        String(process.env.MFA_DEV_MODE).toLowerCase() === "true"
          ? `Development PIN: ${pin}`
          : "A 4-digit verification PIN has been sent to your registered phone."
    });'''

if old in text:
    text=text.replace(old,new)
    path.write_text(text)
    print("MFA controller patched")
else:
    print("MFA response block already changed or not found")
PY


echo "============================================================"
echo "2. PATCHING LOGIN PAGE"
echo "============================================================"

python3 <<'PY'
from pathlib import Path

path = Path(
"client/src/pages/Login.jsx"
)

text = path.read_text()

old = '''state: {
                userId:
                  data.userId,
              },'''

new = '''state: {
                userId:
                  data.userId,

                devPin:
                  data.devPin,
              },'''

if old in text:
    text=text.replace(old,new)
    path.write_text(text)
    print("Login page patched")
else:
    print("Login navigation already patched or pattern not found")
PY


echo "============================================================"
echo "3. PATCHING CUSTOMER MFA PAGE"
echo "============================================================"

python3 <<'PY'
from pathlib import Path

path = Path(
"client/src/pages/CustomerMfa.jsx"
)

text = path.read_text()


if "const devPin = location.state?.devPin;" not in text:

    text=text.replace(
        "const location = useLocation();",
        "const location = useLocation();\n\n  const devPin = location.state?.devPin;"
    )


marker = '''Enter the 4-digit PIN sent to your registered phone.'''

insert = '''

{devPin && (
  <div className="mt-4 rounded-xl bg-yellow-100 p-3 text-center font-bold text-yellow-900">
    Development PIN: {devPin}
  </div>
)}

'''

if "Development PIN:" not in text:

    text=text.replace(
        marker,
        marker + insert
    )

path.write_text(text)

print("Customer MFA patched")

PY


echo "============================================================"
echo "4. VERIFYING PATCH"
echo "============================================================"


grep -R "devPin" \
server/controllers/mfaController.js \
client/src/pages/Login.jsx \
client/src/pages/CustomerMfa.jsx


echo
echo "============================================================"
echo "5. GIT COMMIT + PUSH"
echo "============================================================"


git add -A

git commit \
-m "Expose MFA development PIN for sandbox login testing" \
|| echo "Nothing new to commit"

git push origin main


echo
echo "============================================================"
echo "MFA DEV PIN PATCH COMPLETE"
echo "============================================================"

echo
echo "Backup stored:"
echo "$PROJECT/mfa_backup"

