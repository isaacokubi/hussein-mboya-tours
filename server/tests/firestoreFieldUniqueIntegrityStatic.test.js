import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());

test("Firestore field uniqueness contract exists in the compatibility layer", () => {
  const source = fs.readFileSync(path.join(root, "config/firestore.js"), "utf8");
  assert.match(source, /_uniqueFields/);
  assert.match(source, /rule\.unique === true/);
  assert.match(source, /kind: "field"/);
  assert.match(source, /error\.code = 11000/);
});

test("Representative models still declare field-level uniqueness", () => {
  const models = [
    ["models/Commission.js", /booking: \{[^}]*unique: true/],
    ["models/Customer.js", /unique: true,\s*sparse: true/],
    ["models/PaymentLink.js", /token: \{[^}]*unique: true/],
  ];
  for (const [file, marker] of models) {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    assert.match(source, marker, `missing field-level unique declaration in ${file}`);
  }
});
