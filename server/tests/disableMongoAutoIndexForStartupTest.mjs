/**
 * Purpose: disable Mongo Auto Index For Startup Test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";

// The health test verifies the explicit critical invoice migration. Suppress
// unrelated model auto-index creation so a fresh Atlas database stays small.
// Perform the side effect or state update expressed on the following line.
mongoose.set("autoIndex", false);
// Perform the side effect or state update expressed on the following line.
mongoose.set("autoCreate", false);
