import test from "node:test";
import assert from "node:assert/strict";
import * as firestore from "../config/firestore.js";

const integrationEnabled = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

test("Firestore compatibility layer enforces field-level unique declarations", { skip: !integrationEnabled }, async () => {
  const name = "Phase22UniqueFieldProbe";
  const schema = new firestore.Schema({
    tenantId: { type: firestore.Schema.Types.ObjectId, required: true },
    externalId: { type: String, required: true, unique: true },
    optionalCode: { type: String, unique: true, sparse: true },
  });
  const Model = firestore.model(name, schema);
  const first = await Model.create({ tenantId: "tenant-a", externalId: "EXT-1" });
  assert.ok(first?._id);

  await assert.rejects(
    () => Model.create({ tenantId: "tenant-b", externalId: "EXT-1" }),
    (error) => error?.code === 11000,
  );

  const same = await Model.findById(first._id);
  same.optionalCode = "OPT-1";
  await same.save();

  const duplicateOptional = await Model.create({ tenantId: "tenant-c", externalId: "EXT-2", optionalCode: "OPT-1" }).catch((error) => error);
  assert.equal(duplicateOptional?.code, 11000);

  const sparseAllowed = await Model.create({ tenantId: "tenant-d", externalId: "EXT-3" });
  assert.ok(sparseAllowed?._id);
});

test("Firestore Schema records field-level unique declarations for static compatibility", () => {
  const schema = new firestore.Schema({
    booking: { type: firestore.Schema.Types.ObjectId, unique: true },
    optionalCode: { type: String, unique: true, sparse: true },
    ordinary: { type: String },
  });
  assert.deepEqual(schema._uniqueFields, ["booking", "optionalCode"]);
});
