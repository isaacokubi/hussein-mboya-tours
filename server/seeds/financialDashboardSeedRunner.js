import dotenv from "dotenv";
import { main } from "./financialDashboardSeed.js";

dotenv.config();

main().catch((error) => {
  console.error("Financial dashboard seed runner failed:", error.message);
  process.exitCode = 1;
});
