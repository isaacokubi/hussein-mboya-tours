import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const tourCategorySchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true, required: false },
    name: { type: String, required: true, trim: true },
    // A category slug is unique inside a tenant, not globally. This is required
    // for two companies to both use normal categories such as "safari".
    slug: { type: String, required: true, lowercase: true, trim: true },
    icon: { type: String, default: "Map" },
    description: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tourCategorySchema.index({ tenantId: 1, slug: 1 }, { unique: true, name: "tenant_category_slug_unique" });
tourCategorySchema.plugin(tenantPlugin);

export default mongoose.models.TourCategory || mongoose.model("TourCategory", tourCategorySchema);
