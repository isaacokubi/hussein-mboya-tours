import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

test("RBAC uses canonical role names and consolidates legacy aliases", () => {
  const roleUtils = read("utils/roleUtils.js");
  const controller = read("controllers/adminRoleController.js");

  assert.match(roleUtils, /tour_manager: "tour_manager"/);
  assert.match(roleUtils, /tour_guide: "tour_guide"/);
  assert.match(controller, /tour_manager:/);
  assert.match(controller, /tour_guide:/);
  assert.match(controller, /ROLE_ALIAS_GROUPS/);
  assert.match(controller, /User\.updateMany/);
  assert.match(controller, /Role\.deleteMany/);
  assert.match(controller, /Use the canonical role name/);
});
