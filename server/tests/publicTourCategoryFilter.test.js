/**
 * Purpose: public Tour Category Filter.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../controllers/tourController.js so this module can use its exported dependencies.
import { categoryFilter } from "../controllers/tourController.js";

// Perform the side effect or state update expressed on the following line.
test("public tour category matching is case-insensitive and treats input literally", () => {
  // Declare filter for use by the surrounding module or function.
  const filter = categoryFilter("beach.*");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(filter.$regex, "^beach\\.\\*$");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(filter.$options, "i");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(new RegExp(filter.$regex, filter.$options).test("Beach.*"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(new RegExp(filter.$regex, filter.$options).test("Beach holiday"), false);
});
