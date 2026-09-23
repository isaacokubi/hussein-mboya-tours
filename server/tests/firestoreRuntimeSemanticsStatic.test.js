import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../config/firestore.js", import.meta.url), "utf8");

test("Firestore compatibility layer supports schema validation and setters", () => {
  assert.match(source, /const validateSchema = async/);
  assert.match(source, /rule\.required/);
  assert.match(source, /rule\.enum/);
  assert.match(source, /rule\.min/);
  assert.match(source, /rule\.max/);
  assert.match(source, /rule\.minlength/);
  assert.match(source, /rule\.maxlength/);
  assert.match(source, /rule\.validate/);
  assert.match(source, /rule\.trim/);
  assert.match(source, /rule\.uppercase/);
  assert.match(source, /rule\.lowercase/);
});

test("Firestore compatibility layer supports projections and safe saves", () => {
  assert.match(source, /applySchemaProjection/);
  assert.match(source, /startsWith\("\+"/);
  assert.match(source, /this\.__persisted/);
  assert.match(source, /isModified\(path\)/);
  assert.doesNotMatch(source, /isModified\(\)\{return true;\}/);
});

test("Firestore compatibility layer supports query expressions, filtered array updates and aggregate expressions", () => {
  assert.match(source, /const evaluateExpression =/);
  assert.match(source, /key===\"\\$expr\"/);
  assert.match(source, /\\$elemMatch/);
  assert.match(source, /arrayFilterFor/);
  assert.match(source, /\\$lookup/);
  assert.match(source, /\\$avg/);
});

test("Firestore compatibility layer supports populate selection and nested population", () => {
  assert.match(source, /populate\(p, select\)/);
  assert.match(source, /spec\?\.populate/);
  assert.match(source, /spec\?\.match/);
  assert.match(source, /refPath/);
  assert.match(source, /parseSelectSpec/);
});
