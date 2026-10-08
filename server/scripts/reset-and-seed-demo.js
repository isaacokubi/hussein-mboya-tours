import "dotenv/config";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Backward-compatible command name. The authoritative comprehensive seed owns
// all account definitions and performs the target, namespace, and safety checks.
if (process.env.CONFIRM_DEMO_RESET !== "YES") {
  throw new Error("Refusing demo seed. Set CONFIRM_DEMO_RESET=YES to confirm the namespace-scoped seed operation.");
}

const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
execFileSync(process.execPath, [path.join(serverDir, "seeds/completeTestDemoSeed.js")], {
  cwd: serverDir,
  env: { ...process.env, CONFIRM_TEST_SEED: "YES" },
  stdio: "inherit",
});
