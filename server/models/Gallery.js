/**
 * Purpose: Gallery database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

// Declare gallerySchema for use by the surrounding module or function.
const gallerySchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
    title: { type: String, required: true, trim: true },
    image: { url: String, publicId: String },
    category: {
      type: String,
      enum: ["Safari", "Beach", "Culture", "Adventure", "Vehicle"],
      default: "Safari",
    },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Perform the side effect or state update expressed on the following line.
gallerySchema.plugin(tenantPlugin);

export default mongoose.models.Gallery || mongoose.model("Gallery", gallerySchema);
