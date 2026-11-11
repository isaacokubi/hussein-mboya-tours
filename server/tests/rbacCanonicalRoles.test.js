/**
 * Purpose: rbac Canonical Roles.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";

// Declare read for use by the surrounding module or function.
const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

// Perform the side effect or state update expressed on the following line.
test("RBAC uses canonical role names and consolidates legacy aliases", () => {
  // Declare roleUtils for use by the surrounding module or function.
  const roleUtils = read("utils/roleUtils.js");
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/adminRoleController.js");

  // Perform the side effect or state update expressed on the following line.
  assert.match(roleUtils, /tour_manager: "tour_manager"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(roleUtils, /tour_guide: "tour_guide"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /tour_manager:/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /tour_guide:/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /ROLE_ALIAS_GROUPS/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /User\.updateMany/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /Role\.deleteMany/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /Use the canonical role name/);
});
