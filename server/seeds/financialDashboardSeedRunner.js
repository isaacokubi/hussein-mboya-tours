/**
 * Purpose: financial Dashboard Seed Runner database seed module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import dotenv from "dotenv";
// Load ./financialDashboardSeed.js so this module can use its exported dependencies.
import { main } from "./financialDashboardSeed.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Perform the side effect or state update expressed on the following line.
main().catch((error) => {
  // Perform the side effect or state update expressed on the following line.
  console.error("Financial dashboard seed runner failed:", error.message);
  // Perform the side effect or state update expressed on the following line.
  process.exitCode = 1;
});
