import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=(p)=>fs.readFileSync(p,"utf8");
test("M-Pesa controller uses the shared callback contract",()=>{const source=read("controllers/mpesaController.js"); assert.match(source,/parseMpesaStkCallback/); assert.match(source,/validateSuccessfulMpesaCallback/); assert.match(source,/mpesaCallbackEventId/);});
test("callback contract is included in the service syntax gate",()=>{const pkg=JSON.parse(read("package.json")); assert.match(pkg.scripts["check:services"],/mpesaCallbackContract\\.js/);});
test("payment lifecycle persists callback event identity",()=>{const source=read("services/paymentLifecycleService.js"); assert.match(source,/paymentData\.callbackEventId/); assert.match(source,/paymentDoc\.callbackEventId/);});
