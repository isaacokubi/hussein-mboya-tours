import mongoose from "mongoose";

// The health test verifies the explicit critical invoice migration. Suppress
// unrelated model auto-index creation so a fresh Atlas database stays small.
mongoose.set("autoIndex", false);
