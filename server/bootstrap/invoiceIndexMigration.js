import Invoice from "../models/Invoice.js";

export const migrateInvoiceIndexes = async () => {
  const indexes = await Invoice.collection.indexes();
  const legacy = indexes.find((index) => index.name === "tenantId_1_booking_1" && !index.partialFilterExpression);
  if (legacy) {
    try { await Invoice.collection.dropIndex(legacy.name); } catch (error) { if (error?.code !== 27) throw error; }
  }
  await Invoice.collection.createIndex({ tenantId: 1, booking: 1 }, { name: "tenantId_1_booking_1", unique: true, partialFilterExpression: { booking: { $type: "objectId" } } });
  await Invoice.collection.createIndex({ tenantId: 1, hospitalityBooking: 1, hospitalityType: 1 }, { name: "tenantId_1_hospitalityBooking_1_hospitalityType_1", unique: true, partialFilterExpression: { hospitalityBooking: { $type: "objectId" } } });
};
