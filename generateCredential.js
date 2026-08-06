const fs = require("fs");
const crypto = require("crypto");

const initiatorPassword = "YOUR_INITIATOR_PASSWORD";

const certificate = fs.readFileSync(
  "./server/certs/cert.cer"
);

const securityCredential = crypto.publicEncrypt(
  {
    key: certificate,
    padding: crypto.constants.RSA_PKCS1_PADDING,
  },
  Buffer.from(initiatorPassword)
).toString("base64");

console.log("\nSecurity Credential:\n");
console.log(securityCredential);
