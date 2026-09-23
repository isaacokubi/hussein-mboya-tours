import test from "node:test";
import assert from "node:assert/strict";
import * as firestore from "../config/firestore.js";

const integrationEnabled = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

const Child = firestore.models.Phase23RuntimeChild || firestore.model("Phase23RuntimeChild", new firestore.Schema({
  tenantId: { type: firestore.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true, trim: true },
  secret: { type: String, select: false, default: "child-secret" },
}));

const Permission = firestore.models.Phase23RuntimePermission || firestore.model("Phase23RuntimePermission", new firestore.Schema({
  tenantId: { type: firestore.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
}));

const Role = firestore.models.Phase23RuntimeRole || firestore.model("Phase23RuntimeRole", new firestore.Schema({
  tenantId: { type: firestore.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  permissions: [{ type: firestore.Schema.Types.ObjectId, ref: "Phase23RuntimePermission" }],
}));

const Parent = firestore.models.Phase23RuntimeParent || firestore.model("Phase23RuntimeParent", new firestore.Schema({
  tenantId: { type: firestore.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true, trim: true, maxlength: 20 },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  amount: { type: Number, min: 0, max: 100 },
  code: { type: String, uppercase: true, trim: true },
  child: { type: firestore.Schema.Types.ObjectId, ref: "Phase23RuntimeChild" },
  role: { type: firestore.Schema.Types.ObjectId, ref: "Phase23RuntimeRole" },
  hidden: { type: String, select: false, default: "keep-me" },
}, { timestamps: true }));

const collections = ["phase23RuntimeParent", "phase23RuntimeChild", "phase23RuntimeRole", "phase23RuntimePermission"];

const cleanup = async () => {
  for (const name of collections) {
    const snap = await firestore.db.collection(name).get();
    await Promise.all(snap.docs.map((doc) => doc.ref.delete()));
  }
};

test.beforeEach(async () => { if (integrationEnabled) await cleanup(); });
test.after(async () => { if (integrationEnabled) await cleanup(); });

test("Firestore runtime enforces required, enum and numeric/string constraints", { skip: !integrationEnabled }, async () => {
  await assert.rejects(() => Parent.create({ tenantId: "tenant-a", amount: 10 }), /Validation failed.*title/);
  await assert.rejects(() => Parent.create({ tenantId: "tenant-a", title: "ok", status: "broken", amount: 10 }), /Validation failed.*status/);
  await assert.rejects(() => Parent.create({ tenantId: "tenant-a", title: "ok", amount: -1 }), /Validation failed.*amount/);
  await assert.rejects(() => Parent.create({ tenantId: "tenant-a", title: "this title is definitely too long", amount: 10 }), /Validation failed.*title/);
});

test("Firestore runtime applies setters/defaults and preserves hidden fields across save", { skip: !integrationEnabled }, async () => {
  const created = await Parent.create({ tenantId: "tenant-a", title: "  Nairobi  ", amount: 50, code: " ab-123 " });
  assert.equal(created.title, "Nairobi");
  assert.equal(created.code, "AB-123");
  assert.equal(created.status, "active");
  await assert.doesNotReject(() => created.validate());

  const loaded = await Parent.findById(created._id);
  assert.equal(loaded.hidden, undefined);
  assert.equal(loaded.isModified("amount"), false);
  loaded.amount = 55;
  assert.equal(loaded.isModified("amount"), true);
  await loaded.save();

  const reloaded = await Parent.findById(created._id).select("+hidden");
  assert.equal(reloaded.hidden, "keep-me");
  assert.equal(reloaded.amount, 55);

  const deleted = await reloaded.deleteOne();
  assert.equal(deleted.deletedCount, 1);
  assert.equal(await Parent.findById(created._id), null);
});


test("Firestore runtime supports expression filters, elemMatch, filtered array updates and aggregate lookup expressions", { skip: !integrationEnabled }, async () => {
  const child = await Child.create({ tenantId: "tenant-a", name: "Aggregate Child" });
  const parent = await Parent.create({
    tenantId: "tenant-a",
    title: "Capacity",
    amount: 80,
    child: child._id,
    availability: [{ date: new Date("2026-10-01T00:00:00.000Z"), bookedSlots: 2 }, { date: new Date("2026-10-02T00:00:00.000Z"), bookedSlots: 1 }],
  });

  const exprMatch = await Parent.findOne({ _id: parent._id, $expr: { $gte: ["$amount", 75] } }).lean();
  assert.equal(String(exprMatch._id), String(parent._id));

  const elemMatch = await Parent.findOne({
    _id: parent._id,
    availability: { $elemMatch: { date: { $gte: new Date("2026-10-01T00:00:00.000Z"), $lt: new Date("2026-10-02T00:00:00.000Z") } } },
  }).lean();
  assert.equal(String(elemMatch._id), String(parent._id));

  const updated = await Parent.findOneAndUpdate(
    { _id: parent._id },
    { $inc: { "availability.$[day].bookedSlots": 3 } },
    { arrayFilters: [{ "day.date": { $gte: new Date("2026-10-01T00:00:00.000Z"), $lt: new Date("2026-10-02T00:00:00.000Z") } }], new: true },
  );
  assert.equal(updated.availability[0].bookedSlots, 5);
  assert.equal(updated.availability[1].bookedSlots, 1);

  const aggregate = await Parent.aggregate([
    { $match: { _id: parent._id } },
    { $lookup: { from: "phase23RuntimeChildren", localField: "child", foreignField: "_id", as: "childDoc" } },
    { $unwind: "$childDoc" },
    { $project: { _id: 1, childName: "$childDoc.name", net: { $subtract: ["$amount", 10] } } },
  ]);
  assert.equal(aggregate[0].childName, "Aggregate Child");
  assert.equal(aggregate[0].net, 70);
});

test("Firestore runtime supports select plus syntax and populate selection/nesting", { skip: !integrationEnabled }, async () => {
  const permission = await Permission.create({ tenantId: "tenant-a", name: "finance.read" });
  const role = await Role.create({ tenantId: "tenant-a", name: "finance", permissions: [permission._id] });
  const child = await Child.create({ tenantId: "tenant-a", name: "Customer One", secret: "do-not-leak" });
  const parent = await Parent.create({ tenantId: "tenant-a", title: "Booking", amount: 20, child: child._id, role: role._id });

  const hiddenDefault = await Parent.findById(parent._id).lean();
  assert.equal(hiddenDefault.hidden, undefined);
  const withHidden = await Parent.findById(parent._id).select("+hidden").lean();
  assert.equal(withHidden.hidden, "keep-me");

  const populated = await Parent.findById(parent._id)
    .populate("child", "name")
    .populate({ path: "role", populate: { path: "permissions", select: "name" } })
    .lean();

  assert.equal(populated.child.name, "Customer One");
  assert.equal(populated.child.secret, undefined);
  assert.equal(populated.role.name, "finance");
  assert.equal(populated.role.permissions[0].name, "finance.read");
});
