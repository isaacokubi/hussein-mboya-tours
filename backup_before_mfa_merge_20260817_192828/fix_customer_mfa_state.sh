#!/bin/bash

set -e

echo "=============================================="
echo "FIXING CUSTOMER MFA STATE HANDOFF"
echo "=============================================="

python3 <<'PY'
from pathlib import Path


# ==============================
# FIX CustomerMfa.jsx
# ==============================

p = Path("client/src/pages/CustomerMfa.jsx")

t = p.read_text()


# remove useLocation import
t = t.replace(
    'import { useLocation, useNavigate } from "react-router-dom";',
    'import { useNavigate } from "react-router-dom";'
)

t = t.replace(
    'import { useLocation } from "react-router-dom";',
    ''
)


# change component props
t = t.replace(
    'export default function CustomerMfa() {',
    'export default function CustomerMfa({ userId, devPin }) {'
)


# remove old location state block
old = """
  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId;
  const devPin = location.state?.devPin;
"""

new = """
  const navigate = useNavigate();
"""

t = t.replace(old,new)


# remove any remaining location usage
t = t.replace(
    'const location = useLocation();',
    ''
)


p.write_text(t)

print("CustomerMfa.jsx fixed")


# ==============================
# FIX Login.jsx
# ==============================

p = Path("client/src/pages/Login.jsx")

t = p.read_text()


# replace state
t = t.replace(
    'const [mfaUserId, setMfaUserId] = useState("");',
    'const [mfaData, setMfaData] = useState(null);'
)


# replace MFA response handling
old = """
      if (response?.mfaRequired) {
        setMfaUserId(String(response.userId || ""));
        toast.info(response.message || "Verification PIN sent to your registered phone.");
        return;
      }
"""

new = """
      if (response?.mfaRequired) {

        setMfaData({
          userId: response.userId,
          devPin: response.devPin
        });

        toast.info(
          response.message ||
          "Verification PIN sent to your registered phone."
        );

        return;
      }
"""


if old in t:
    t=t.replace(old,new)
else:
    print("WARNING: MFA block not found")


# replace CustomerMfa rendering
old = """
  if (mfaUserId) return <CustomerMfa userId={mfaUserId} />;
"""

new = """
  if (mfaData) {
    return (
      <CustomerMfa
        userId={mfaData.userId}
        devPin={mfaData.devPin}
      />
    );
  }
"""


if old in t:
    t=t.replace(old,new)
else:
    print("WARNING: CustomerMfa render block not found")


p.write_text(t)

print("Login.jsx fixed")

PY


echo
echo "=============================================="
echo "BUILD TEST"
echo "=============================================="

cd client

npm run build


echo
echo "=============================================="
echo "GIT COMMIT"
echo "=============================================="

cd ..

git add client/src/pages/Login.jsx client/src/pages/CustomerMfa.jsx

git commit -m "Fix MFA state handoff between login and verification" || true

git push origin main


echo
echo "=============================================="
echo "DONE"
echo "=============================================="
