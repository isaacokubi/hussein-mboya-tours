import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import TravelGuide from "../models/TravelGuide.js";

test("travel guides require tenant ownership and article content", async () => {
  const guide = new TravelGuide({ title: "Packing for a safari", slug: "packing-for-a-safari" });
  await assert.rejects(() => guide.validate(), (error) => {
    assert.ok(error.errors.tenantId);
    assert.ok(error.errors.content);
    return true;
  });
});

test("travel guide defaults to private draft and validates publication states", async () => {
  const guide = new TravelGuide({
    tenantId: new mongoose.Types.ObjectId(),
    title: "Packing for a safari",
    slug: "packing-for-a-safari",
    content: "Bring layers, sun protection and reusable water bottles.",
  });
  await guide.validate();
  assert.equal(guide.status, "draft");
  assert.equal(guide.publishedAt, null);
  guide.status = "published";
  await guide.validate();
  assert.equal(guide.status, "published");
  guide.status = "public";
  await assert.rejects(() => guide.validate());
});

test("travel guide slugs are unique within each tenant, not across the platform", () => {
  const indexes = TravelGuide.schema.indexes();
  assert.ok(indexes.some(([keys, options]) =>
    keys.tenantId === 1 && keys.slug === 1 && options.unique === true
  ));
  assert.equal(TravelGuide.schema.path("tenantId").options.required, true);
});
