/**
 * Purpose: finance Reporting Service business-logic service. Main declarations: buildDateFilter, revenueMatch, getPostedRevenueReport, getPostedRevenueTotal.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/JournalEntry.js so this module can use its exported dependencies.
import JournalEntry from "../models/JournalEntry.js";
// Load ../models/ChartOfAccount.js so this module can use its exported dependencies.
import ChartOfAccount from "../models/ChartOfAccount.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId } from "../tenancy/context.js";

// Declare buildDateFilter for use by the surrounding module or function.
const buildDateFilter = ({ from, to } = {}) => {
  // Declare entryDate for use by the surrounding module or function.
  const entryDate = {};
  // Check the condition (from) and run the matching branch.
  if (from) {
    // Declare start for use by the surrounding module or function.
    const start = new Date(from);
    // Check the condition (!Number.isNaN(start.getTime())) and run the matching branch.
    if (!Number.isNaN(start.getTime())) entryDate.$gte = start;
  }
  // Check the condition (to) and run the matching branch.
  if (to) {
    // Declare end for use by the surrounding module or function.
    const end = new Date(to);
    // Check the condition (!Number.isNaN(end.getTime())) and run the matching branch.
    if (!Number.isNaN(end.getTime())) entryDate.$lte = end;
  }
  // Return the expression shown below to the caller.
  return Object.keys(entryDate).length ? { entryDate } : {};
};

// Declare revenueMatch for use by the surrounding module or function.
const revenueMatch = ({ from, to } = {}, tenantId) => ({
  tenantId,
  status: "posted",
  ...buildDateFilter({ from, to }),
});

// Declare getPostedRevenueReport for use by the surrounding module or function.
export const getPostedRevenueReport = async ({ from, to } = {}) => {
  // Aggregation pipelines do not cast IDs like Mongoose queries do.
  // Apply the authenticated tenant to both journals and revenue accounts.
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = new mongoose.Types.ObjectId(String(requireTenantId()));
  // Declare [result] for use by the surrounding module or function.
  const [result] = await JournalEntry.aggregate([
    { $match: revenueMatch({ from, to }, tenantId) },
    { $unwind: "$lines" },
    {
      $lookup: {
        from: ChartOfAccount.collection.name,
        localField: "lines.account",
        foreignField: "_id",
        as: "account",
      },
    },
    { $unwind: "$account" },
    { $match: { "account.tenantId": tenantId, "account.type": "revenue", "account.active": true } },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $subtract: [
                    { $ifNull: ["$lines.credit", 0] },
                    { $ifNull: ["$lines.debit", 0] },
                  ],
                },
              },
            },
          },
        ],
        monthly: [
          {
            $group: {
              _id: {
                year: { $year: "$entryDate" },
                month: { $month: "$entryDate" },
              },
              revenue: {
                $sum: {
                  $subtract: [
                    { $ifNull: ["$lines.credit", 0] },
                    { $ifNull: ["$lines.debit", 0] },
                  ],
                },
              },
              transactions: { $addToSet: "$_id" },
            },
          },
          {
            $project: {
              _id: 1,
              revenue: { $round: ["$revenue", 2] },
              transactions: { $size: "$transactions" },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ],
      },
    },
  ]);

  // Return the object assembled below to the caller.
  return {
    total: Number(result?.summary?.[0]?.total || 0),
    monthly: result?.monthly || [],
  };
};

// Declare getPostedRevenueTotal for use by the surrounding module or function.
export const getPostedRevenueTotal = async (options = {}) => {
  // Declare report for use by the surrounding module or function.
  const report = await getPostedRevenueReport(options);
  // Return the total value to the caller.
  return report.total;
};

export default getPostedRevenueReport;
