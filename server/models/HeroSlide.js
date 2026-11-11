/**
 * Purpose: Hero Slide database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

// Declare heroSlideSchema for use by the surrounding module or function.
const heroSlideSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    video: { url: String, publicId: String },
    image: { url: String, publicId: String },
    badge: { type: String, default: "Discover Africa" },
    buttonOne: {
      text: { type: String, default: "Explore Tours" },
      link: { type: String, default: "/tours" },
    },
    buttonTwo: {
      text: { type: String, default: "Book Now" },
      link: { type: String, default: "/contact" },
    },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Perform the side effect or state update expressed on the following line.
heroSlideSchema.plugin(tenantPlugin);

export default mongoose.models.HeroSlide || mongoose.model("HeroSlide", heroSlideSchema);
