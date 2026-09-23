import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("maintained Firestore seed utilities do not retain MongoDB environment requirements", () => {
  for (const path of ["seeds/destinationSeed.js", "seeds/replaceGlobalToursImages.js"]) {
    const source = read(path);
    assert.match(source, /FIREBASE_PROJECT_ID/);
    assert.doesNotMatch(source, /MONGODB_URI|MONGODB_URL|mongoose/i);
  }
});

test("global error handling supports Firestore validation errors without assuming MongoDB error shape", () => {
  const source = read("middleware/errorMiddleware.js");
  assert.match(source, /err\.errors && typeof err\.errors === "object"/);
  assert.match(source, /err\.message \|\| "Validation failed"/);
});
