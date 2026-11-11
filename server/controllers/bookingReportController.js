/**
 * Purpose: booking Report Controller HTTP controller. Main declarations: firstNonEmpty, populateAgent, isValidObjectId, dailyBookingReport, monthlyBookingReport.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";

// Declare agentLookupStages for use by the surrounding module or function.
const agentLookupStages = [
  { $lookup: { from: "agents", localField: "_id", foreignField: "_id", as: "agentProfile" } },
  { $unwind: { path: "$agentProfile", preserveNullAndEmptyArrays: true } },
  { $lookup: { from: "users", localField: "agentProfile.user", foreignField: "_id", as: "agentUser" } },
  { $unwind: { path: "$agentUser", preserveNullAndEmptyArrays: true } },
  { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "legacyAgentUser" } },
  { $unwind: { path: "$legacyAgentUser", preserveNullAndEmptyArrays: true } },
];

// Declare firstNonEmpty for use by the surrounding module or function.
const firstNonEmpty = (...values) => ({
  $let: {
    vars: { values },
    in: {
      $reduce: {
        input: "$$values",
        initialValue: "",
        in: { $cond: [{ $ne: ["$$value", ""] }, "$$value", { $ifNull: ["$$this", ""] }] },
      },
    },
  },
});

// Declare agentNameExpression for use by the surrounding module or function.
const agentNameExpression = firstNonEmpty(
  "$agentUser.name",
  "$agentProfile.companyName",
  "$agentProfile.email",
  "$agentUser.email",
  "$legacyAgentUser.name",
  "$legacyAgentUser.email"
);

// Declare agentEmailExpression for use by the surrounding module or function.
const agentEmailExpression = firstNonEmpty(
  "$agentUser.email",
  "$agentProfile.email",
  "$legacyAgentUser.email"
);

// Declare agentPhoneExpression for use by the surrounding module or function.
const agentPhoneExpression = firstNonEmpty(
  "$agentUser.phone",
  "$agentProfile.phone",
  "$legacyAgentUser.phone"
);

// Declare populateAgent for use by the surrounding module or function.
const populateAgent = (query) =>
  query.populate({
    path: "agent",
    select: "companyName email phone status isApproved user",
    populate: { path: "user", select: "name email phone status" },
  });

// Declare isValidObjectId for use by the surrounding module or function.
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// Declare dailyBookingReport for use by the surrounding module or function.
export const dailyBookingReport = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare start for use by the surrounding module or function.
    const start = new Date();
    // Perform the side effect or state update expressed on the following line.
    start.setHours(0, 0, 0, 0);
    // Declare end for use by the surrounding module or function.
    const end = new Date();
    // Perform the side effect or state update expressed on the following line.
    end.setHours(23, 59, 59, 999);

    // Declare bookingQuery for use by the surrounding module or function.
    let bookingQuery = Booking.find(
      mergeTenantFilter(req, { createdAt: { $gte: start, $lte: end }, isDeleted: { $ne: true } })
    )
      .populate("tour", "title")
      .sort({ createdAt: -1 });
    // Perform the side effect or state update expressed on the following line.
    bookingQuery = populateAgent(bookingQuery);
    // Declare bookings for use by the surrounding module or function.
    const bookings = await bookingQuery;

    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare monthlyBookingReport for use by the surrounding module or function.
export const monthlyBookingReport = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare now for use by the surrounding module or function.
    const now = new Date();
    // Declare yearValue for use by the surrounding module or function.
    const yearValue = Number(req.query.year);
    // Declare monthValue for use by the surrounding module or function.
    const monthValue = Number(req.query.month);
    // Declare year for use by the surrounding module or function.
    const year = Number.isInteger(yearValue) && yearValue >= 2000 ? yearValue : now.getFullYear();
    // Declare month for use by the surrounding module or function.
    const month = Number.isInteger(monthValue) && monthValue >= 1 && monthValue <= 12 ? monthValue : now.getMonth() + 1;
    // Declare start for use by the surrounding module or function.
    const start = new Date(year, month - 1, 1);
    // Declare end for use by the surrounding module or function.
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    // Declare bookingQuery for use by the surrounding module or function.
    let bookingQuery = Booking.find(
      mergeTenantFilter(req, { createdAt: { $gte: start, $lte: end }, isDeleted: { $ne: true } })
    )
      .populate("tour", "title")
      .sort({ createdAt: -1 });
    // Perform the side effect or state update expressed on the following line.
    bookingQuery = populateAgent(bookingQuery);
    // Declare bookings for use by the surrounding module or function.
    const bookings = await bookingQuery;

    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, year, month, count: bookings.length, bookings });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare tourBookingReport for use by the surrounding module or function.
export const tourBookingReport = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare data for use by the surrounding module or function.
    const data = await Booking.aggregate([
      {
        $match: {
          tenantId: req.tenantId,
          isDeleted: { $ne: true },
        },
      },
      {
        $lookup: {
          from: "payments",
          let: { bookingId: "$_id", tenantId: "$tenantId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$booking", "$bookingId"] },
                    { $eq: ["$tenantId", "$tenantId"] },
                    { $in: ["$status", ["completed", "refunded"]] },
                  ],
                },
              },
            },
            {
              $project: {
                net: {
                  $max: [
                    0,
                    {
                      $subtract: [
                        { $ifNull: ["$amount", 0] },
                        { $ifNull: ["$refundedAmount", 0] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "paymentLedger",
        },
      },
      {
        $project: {
          tour: 1,
          bookingValue: {
            $max: [
              0,
              {
                $subtract: [
                  { $ifNull: ["$totalAmount", 0] },
                  { $ifNull: ["$refundAmount", 0] },
                ],
              },
            ],
          },
          ledgerValue: { $sum: "$paymentLedger.net" },
          isPaidBooking: {
            $in: [
              { $toLower: { $ifNull: ["$paymentStatus", ""] } },
              ["paid", "completed", "success"],
            ],
          },
          isExcludedBooking: {
            $in: [
              { $toLower: { $ifNull: ["$status", ""] } },
              ["cancelled", "refunded"],
            ],
          },
        },
      },
      {
        $project: {
          tour: 1,
          recognizedValue: {
            $cond: [
              { $and: ["$isPaidBooking", { $not: ["$isExcludedBooking"] }] },
              {
                $cond: [
                  { $gt: ["$bookingValue", 0] },
                  "$bookingValue",
                  "$ledgerValue",
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$tour",
          totalBookings: { $sum: 1 },
          revenue: { $sum: "$recognizedValue" },
        },
      },
      { $lookup: { from: "tours", localField: "_id", foreignField: "_id", as: "tour" } },
      { $unwind: { path: "$tour", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          tourId: "$_id",
          title: {
            $cond: [
              { $ne: [{ $ifNull: ["$tour.title", ""] }, ""] },
              "$tour.title",
              { $concat: ["Tour ID: ", { $toString: "$_id" }] },
            ],
          },
          tourAvailable: { $ne: [{ $ifNull: ["$tour._id", null] }, null] },
          totalBookings: 1,
          revenue: 1,
        },
      },
      { $sort: { totalBookings: -1, revenue: -1 } },
    ]);
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare agentBookingReport for use by the surrounding module or function.
export const agentBookingReport = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare data for use by the surrounding module or function.
    const data = await Booking.aggregate([
      { $match: { tenantId: req.tenantId, agent: { $ne: null }, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: "$agent",
          totalBookings: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: [{ $toLower: { $ifNull: ["$paymentStatus", ""] } }, ["paid", "completed", "success"]] },
                    { $not: [{ $in: [{ $toLower: { $ifNull: ["$status", ""] } }, ["cancelled", "refunded"]] }] },
                  ],
                },
                {
                  $max: [
                    0,
                    {
                      $subtract: [
                        { $ifNull: ["$totalAmount", 0] },
                        { $ifNull: ["$refundAmount", 0] },
                      ],
                    },
                  ],
                },
                0,
              ],
            },
          },
          commission: { $sum: { $ifNull: ["$commissionAmount", 0] } },
        },
      },
      ...agentLookupStages,
      {
        $project: {
          _id: 0,
          agentId: "$_id",
          name: {
            $let: {
              vars: { resolvedName: agentNameExpression },
              in: {
                $cond: [
                  { $ne: ["$$resolvedName", ""] },
                  "$$resolvedName",
                  { $concat: ["Agent ID: ", { $toString: "$_id" }] },
                ],
              },
            },
          },
          email: agentEmailExpression,
          phone: agentPhoneExpression,
          companyName: { $ifNull: ["$agentProfile.companyName", ""] },
          status: {
            $let: {
              vars: {
                resolvedStatus: firstNonEmpty("$agentProfile.status", "$agentUser.status", "$legacyAgentUser.status"),
              },
              in: {
                $cond: [
                  { $ne: ["$$resolvedStatus", ""] },
                  "$$resolvedStatus",
                  { $cond: [{ $eq: [{ $ifNull: ["$agentProfile._id", null] }, null] }, "unlinked", { $cond: [{ $eq: ["$agentProfile.isApproved", true] }, "active", "pending"] }] },
                ],
              },
            },
          },
          isApproved: { $ifNull: ["$agentProfile.isApproved", false] },
          profileAvailable: { $ne: [{ $ifNull: ["$agentProfile._id", null] }, null] },
          userAvailable: {
            $ne: [
              { $ifNull: ["$agentUser._id", { $ifNull: ["$legacyAgentUser._id", null] }] },
              null,
            ],
          },
          totalBookings: 1,
          revenue: 1,
          commission: 1,
        },
      },
      { $sort: { totalBookings: -1, revenue: -1, name: 1 } },
    ]);
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
