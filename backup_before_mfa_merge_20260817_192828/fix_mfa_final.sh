#!/bin/bash

set -e

echo "FIXING MFA FLOW"

python3 <<'PY'
from pathlib import Path

# FIX CONTROLLER
p=Path("server/controllers/mfaController.js")

t=p.read_text()


t=t.replace(
'''return { userId: user._id, phone };''',
'''return {
    userId: user._id,
    phone,
    pin
  };'''
)


t=t.replace(
'''await createCustomerLoginChallenge(user);

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
    });''',
'''const challenge = await createCustomerLoginChallenge(user);

    return res.status(200).json({
      success:true,
      mfaRequired:true,
      userId:user._id,

      devPin:
        String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true"
          ? challenge.pin
          : undefined,

      message:
        String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true"
          ? `Development PIN: ${challenge.pin}`
          : "A 4-digit verification PIN has been sent to your registered phone."
    });'''
)


p.write_text(t)

print("Controller fixed")


# FIX CUSTOMER MFA IMPORT
p=Path("client/src/pages/CustomerMfa.jsx")

t=p.read_text()

t=t.replace(
'import { verifyCustomerPin, sendCustomerPin } from "../api/authApi";',
'import api from "../api/axios";'
)


t=t.replace(
'''await verifyCustomerPin({
        userId,
        pin
      });''',
'''await api.post("/mfa/customer/verify-pin", {
        userId,
        pin
      });'''
)


t=t.replace(
'''await sendCustomerPin({
        userId
      });''',
'''await api.post("/mfa/customer/send-pin", {
        userId
      });'''
)


p.write_text(t)

print("Customer MFA API fixed")

PY


echo "BUILD TEST"

cd client
npm run build

cd ..

git add server/controllers/mfaController.js client/src/pages/CustomerMfa.jsx

git commit -m "Fix customer MFA PIN delivery and API integration" || true

git push origin main

echo "DONE"
