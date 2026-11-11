/**
 * Purpose: Tour Category database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare tourCategorySchema for use by the surrounding module or function.
const tourCategorySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true, required: false },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, trim: true },
  icon: { type: String, default: "Map" },
  description: { type: String, default: "", trim: true },
  image: { type: String, default: "" },
  active: { type: Boolean, default: true },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
tourCategorySchema.index({ tenantId: 1, slug: 1 }, { unique: true, name: "tenant_category_slug_unique" });
// Perform the side effect or state update expressed on the following line.
tourCategorySchema.plugin(tenantPlugin);
export default mongoose.models.TourCategory || mongoose.model("TourCategory", tourCategorySchema);
