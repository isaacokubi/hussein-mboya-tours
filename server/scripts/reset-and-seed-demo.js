/**
 * Purpose: reset and seed demo operational script. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load node:child_process so this module can use its exported dependencies.
import { execFileSync } from "node:child_process";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:url so this module can use its exported dependencies.
import { fileURLToPath } from "node:url";

// Backward-compatible command name. The authoritative comprehensive seed owns
// all account definitions and performs the target, namespace, and safety checks.
// Check the condition (process.env.CONFIRM_DEMO_RESET !== "YES") and run the matching branch.
if (process.env.CONFIRM_DEMO_RESET !== "YES") {
  // Stop the current operation by raising a new Error instance.
  throw new Error("Refusing demo seed. Set CONFIRM_DEMO_RESET=YES to confirm the namespace-scoped seed operation.");
}

// Declare serverDir for use by the surrounding module or function.
const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Perform the side effect or state update expressed on the following line.
execFileSync(process.execPath, [path.join(serverDir, "seeds/completeTestDemoSeed.js")], {
  cwd: serverDir,
  env: { ...process.env, CONFIRM_TEST_SEED: "YES" },
  stdio: "inherit",
});
