import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

const gallerySchema = new firestore.Schema(
  {
    tenantId: { type: firestore.Schema.Types.ObjectId, ref: "Organization", index: true },
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

gallerySchema.plugin(tenantPlugin);

export default firestore.models.Gallery || firestore.model("Gallery", gallerySchema);
