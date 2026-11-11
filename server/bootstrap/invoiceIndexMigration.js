/**
 * Purpose: invoice Index Migration server application module. Main declarations: migrateInvoiceIndexes.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Invoice from "../models/Invoice.js";

// Declare migrateInvoiceIndexes for use by the surrounding module or function.
export const migrateInvoiceIndexes = async () => {
  // Declare indexes for use by the surrounding module or function.
  const indexes = await Invoice.collection.indexes().catch((error) => {
    // listIndexes reports NamespaceNotFound for a fresh deployment database.
    // createIndex below creates the collection as part of the critical setup.
    // Check the condition (error?.code === 26 || error?.codeName === "NamespaceNotFound") and run the matching branch.
    if (error?.code === 26 || error?.codeName === "NamespaceNotFound") return [];
    // Stop the current operation by raising the value of error.
    throw error;
  });
  // Declare legacy for use by the surrounding module or function.
  const legacy = indexes.find((index) => index.name === "tenantId_1_booking_1" && !index.partialFilterExpression);
  // Check the condition (legacy) and run the matching branch.
  if (legacy) {
    // Run this operation with a dedicated error-handling path for failures.
    try { await Invoice.collection.dropIndex(legacy.name); } catch (error) { if (error?.code !== 27) throw error; }
  }
  // Perform the side effect or state update expressed on the following line.
  await Invoice.collection.createIndex({ tenantId: 1, booking: 1 }, { name: "tenantId_1_booking_1", unique: true, partialFilterExpression: { booking: { $type: "objectId" } } });
  // Perform the side effect or state update expressed on the following line.
  await Invoice.collection.createIndex({ tenantId: 1, hospitalityBooking: 1, hospitalityType: 1 }, { name: "tenantId_1_hospitalityBooking_1_hospitalityType_1", unique: true, partialFilterExpression: { hospitalityBooking: { $type: "objectId" } } });
};
