import JournalEntry from "../models/JournalEntry.js";
import ChartOfAccount from "../models/ChartOfAccount.js";

const buildDateFilter = ({ from, to } = {}) => {
  const entryDate = {};
  if (from) {
    const start = new Date(from);
    if (!Number.isNaN(start.getTime())) entryDate.$gte = start;
  }
  if (to) {
    const end = new Date(to);
    if (!Number.isNaN(end.getTime())) entryDate.$lte = end;
  }
  return Object.keys(entryDate).length ? { entryDate } : {};
};

const revenueMatch = ({ from, to } = {}) => ({
  status: "posted",
  ...buildDateFilter({ from, to }),
});

export const getPostedRevenueReport = async ({ from, to } = {}) => {
  const [result] = await JournalEntry.aggregate([
    { $match: revenueMatch({ from, to }) },
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
    { $match: { "account.type": "revenue", "account.active": true } },
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

  return {
    total: Number(result?.summary?.[0]?.total || 0),
    monthly: result?.monthly || [],
  };
};

export const getPostedRevenueTotal = async (options = {}) => {
  const report = await getPostedRevenueReport(options);
  return report.total;
};

export default getPostedRevenueReport;
