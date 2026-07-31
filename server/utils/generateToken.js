// utils/generateToken.js

import jwt from "jsonwebtoken";
import crypto from "crypto";

/*
|--------------------------------------------------------------------------
| GENERATE ACCESS TOKEN
|--------------------------------------------------------------------------
*/

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  const payload = {
    sub: user._id?.toString() || user.id?.toString(),

    role: user.role,

    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",

    issuer: "husseinmboyatours",

    audience: "husseinmboyatours-client",

    jwtid: crypto.randomUUID(),
  });
};

export default generateToken;