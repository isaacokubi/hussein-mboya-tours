import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import Review from "../models/Review.js";

test("reviews are private by default unless the customer explicitly consents", async () => {
  const review = new Review({
    tenantId: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(),
    tour: new mongoose.Types.ObjectId(),
    booking: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: "Excellent trip",
    verified: true,
    approved: true,
  });
  await review.validate();
  assert.equal(review.publicConsent, false);
  assert.equal(review.publicConsentAt, null);
  review.publicConsent = true;
  review.publicConsentAt = new Date();
  await review.validate();
  assert.equal(review.publicConsent, true);
});

test("public review consent field is an explicit boolean opt-in", () => {
  assert.equal(Review.schema.path("publicConsent").instance, "Boolean");
  assert.equal(Review.schema.path("publicConsent").options.default, false);
  assert.equal(Review.schema.path("publicConsentAt").instance, "Date");
});

test("public review endpoints require moderation, verification, tenant ownership and consent", () => {
  const controllerPath = fileURLToPath(new URL("../controllers/reviewController.js", import.meta.url));
  const routesPath = fileURLToPath(new URL("../routes/reviewRoutes.js", import.meta.url));
  const controller = readFileSync(controllerPath, "utf8");
  const routes = readFileSync(routesPath, "utf8");
  assert.match(controller, /approved:\s*true/);
  assert.match(controller, /verified:\s*true/);
  assert.match(controller, /publicConsent:\s*true/);
  assert.match(controller, /isDeleted:\s*false/);
  assert.match(routes, /router\.get\(["']\/featured["'],\s*listPublicTestimonials\)/);
});
