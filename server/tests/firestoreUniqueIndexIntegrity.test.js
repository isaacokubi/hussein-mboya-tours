import test from "node:test";
import assert from "node:assert/strict";

import * as firestore from "../config/firestore.js";

const probeSchema = new firestore.Schema({
  tenantId: { type: String, required: true },
  provider: { type: String, default: "MPESA" },
  reference: { type: String, default: "" },
  active: { type: Boolean, default: true },
}, { timestamps: true });

probeSchema.index(
  { tenantId: 1, provider: 1, reference: 1 },
  {
    unique: true,
    partialFilterExpression: {
      active: true,
      reference: { $type: "string", $gt: "" },
    },
  },
);

const Probe = firestore.models.Phase21UniqueIndexProbe
  || firestore.model("Phase21UniqueIndexProbe", probeSchema);

const tenantId = "phase21-tenant";
const cleanup = async () => {
  const snapshot = await firestore.db.collection("phase21UniqueIndexProbe").get();
  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
};

test.before(async () => {
  await cleanup();
});

test.after(async () => {
  await cleanup();
});

test("Firestore compatibility layer records and enforces unique partial indexes", async () => {
  const first = await Probe.create({
    tenantId,
    provider: "MPESA",
    reference: "ABC123",
    active: true,
  });

  await assert.rejects(
    () => Probe.create({
      tenantId,
      provider: "MPESA",
      reference: "ABC123",
      active: true,
    }),
    (error) => error?.code === 11000 && /Duplicate key/.test(error.message),
  );

  first.reference = "ABC124";
  await first.save();

  const sameKey = await Probe.findOne({
    tenantId,
    provider: "MPESA",
    reference: "ABC124",
  });
  assert.equal(String(sameKey._id), String(first._id));
});

test("partial unique indexes permit inactive historical records", async () => {
  await Probe.create({
    tenantId,
    provider: "MPESA",
    reference: "HIST-001",
    active: false,
  });

  await assert.doesNotReject(() => Probe.create({
    tenantId,
    provider: "MPESA",
    reference: "HIST-001",
    active: true,
  }));
});
