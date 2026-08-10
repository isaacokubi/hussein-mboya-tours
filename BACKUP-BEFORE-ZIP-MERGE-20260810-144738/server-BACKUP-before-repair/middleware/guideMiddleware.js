import { roleMiddleware } from "./roleMiddleware.js";

const guideMiddleware = roleMiddleware("tour_guide", "guide");

export { guideMiddleware };
export default guideMiddleware;
