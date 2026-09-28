import test from "node:test";
import assert from "node:assert/strict";
import { categoryFilter } from "../controllers/tourController.js";

test("public tour category matching is case-insensitive and treats input literally", () => {
  const filter = categoryFilter("beach.*");
  assert.equal(filter.$regex, "^beach\\.\\*$");
  assert.equal(filter.$options, "i");
  assert.equal(new RegExp(filter.$regex, filter.$options).test("Beach.*"), true);
  assert.equal(new RegExp(filter.$regex, filter.$options).test("Beach holiday"), false);
});
