import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

const heroSlideSchema = new firestore.Schema(
  {
    tenantId: { type: firestore.Schema.Types.ObjectId, ref: "Organization", index: true },
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

heroSlideSchema.plugin(tenantPlugin);

export default firestore.models.HeroSlide || firestore.model("HeroSlide", heroSlideSchema);
