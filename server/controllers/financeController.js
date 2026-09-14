import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import Commission from "../models/Commission.js";
import User from "../models/User.js";
import JournalEntry from "../models/JournalEntry.js";
import ChartOfAccount from "../models/ChartOfAccount.js";

const PAYMENT_STATUSES = ["pending", "completed", "failed", "cancelled", "refunded"];
const TRANSACTION_PAGE_SIZE = 10;
const tenantPaymentFilter = (status) => mergeTenantFilter({ status });
const tenantBookingFilter = (extra = {}) => mergeTenantFilter(extra);

export const getFinanceStats = async (req, res, next) => { requireTenantId(); try { const [revenueResult, completedPayments, pendingPayments, failedPayments, refundedPayments, refundedAmountResult, paidBookings, commissionResult] = await Promise.all([Payment.aggregate([{ $match: tenantPaymentFilter("completed") }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]), Payment.countDocuments(tenantPaymentFilter("completed")), Payment.countDocuments(tenantPaymentFilter("pending")), Payment.countDocuments(tenantPaymentFilter("failed")), Payment.countDocuments(tenantPaymentFilter("refunded")), Payment.aggregate([{ $match: tenantPaymentFilter("refunded") }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]), Booking.countDocuments(tenantBookingFilter({ paymentStatus: "paid" })), Commission.aggregate([{ $match: mergeTenantFilter({}) }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }])]); const revenue = revenueResult[0]?.total || 0; const refundedAmount = refundedAmountResult[0]?.total || 0; return res.status(200).json({ success: true, data: { revenue, netRevenue: revenue - refundedAmount, refundedAmount, completedPayments, pendingPayments, failedPayments, refundedPayments, paidBookings, commission: commissionResult[0]?.total || 0 } }); } catch (error) { next(error); } };

export const getTransactions = async (req, res, next) => { requireTenantId(); try { const { page = 1, status, search, startDate, endDate } = req.query; const currentPage = Math.max(Number(page) || 1, 1); const pageSize = TRANSACTION_PAGE_SIZE; const skip = (currentPage - 1) * pageSize; const filter = mergeTenantFilter({}); if (status && PAYMENT_STATUSES.includes(status)) filter.status = status; if (startDate || endDate) { filter.createdAt = {}; if (startDate) filter.createdAt.$gte = new Date(startDate); if (endDate) filter.createdAt.$lte = new Date(endDate); } if (search) { const regex = { $regex: String(search).trim(), $options: "i" }; const [matchingUsers, matchingBookings] = await Promise.all([User.find(mergeTenantFilter({ $or: [{ name: regex }, { email: regex }, { phone: regex }] })).select("_id").lean(), Booking.find(tenantBookingFilter({ bookingNumber: regex })).select("_id").lean()]); filter.$or = [{ transactionId: regex }, { transactionReference: regex }, { mpesaReceiptNumber: regex }, { customer: { $in: matchingUsers.map((user) => user._id) } }, { booking: { $in: matchingBookings.map((booking) => booking._id) } }]; } const [payments, total] = await Promise.all([Payment.find(filter).populate("booking", "bookingNumber travelDate mpesaReceipt transactionId paymentStatus status").populate("customer", "name email phone").populate("user", "name email phone").sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(), Payment.countDocuments(filter)]); return res.status(200).json({ success: true, count: payments.length, pagination: { total, page: currentPage, pages: Math.max(1, Math.ceil(total / pageSize)), limit: pageSize }, data: payments }); } catch (error) { next(error); } };

export const getReports = async (req, res, next) => {
  requireTenantId();
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) {
      const start = new Date(`${from}T00:00:00.000Z`);
      if (!Number.isNaN(start.getTime())) dateFilter.$gte = start;
    }
    if (to) {
      const end = new Date(`${to}T23:59:59.999Z`);
      if (!Number.isNaN(end.getTime())) dateFilter.$lte = end;
    }
    const journalMatch = mergeTenantFilter({ status: "posted", ...(Object.keys(dateFilter).length ? { entryDate: dateFilter } : {}) });
    const monthlyRevenue = await JournalEntry.aggregate([
      { $match: journalMatch },
      { $unwind: "$lines" },
      { $lookup: { from: ChartOfAccount.collection.name, localField: "lines.account", foreignField: "_id", as: "account" } },
      { $unwind: "$account" },
      { $match: { "account.type": "revenue", "account.active": true } },
      { $group: { _id: { year: { $year: "$entryDate" }, month: { $month: "$entryDate" } }, revenue: { $sum: { $subtract: [{ $ifNull: ["$lines.credit", 0] }, { $ifNull: ["$lines.debit", 0] }] } }, transactions: { $addToSet: "$_id" } } },
      { $project: { _id: 1, revenue: { $round: ["$revenue", 2] }, transactions: { $size: "$transactions" } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    const collectionMatch = tenantPaymentFilter("completed");
    if (Object.keys(dateFilter).length) collectionMatch.createdAt = dateFilter;
    const monthlyCollections = await Payment.aggregate([
      { $match: collectionMatch },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, collections: { $sum: { $ifNull: ["$amount", 0] } }, transactions: { $sum: 1 } } },
      { $project: { _id: 1, collections: { $round: ["$collections", 2] }, transactions: 1 } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    return res.status(200).json({ success: true, data: { monthlyRevenue, monthlyCollections, revenueBasis: "posted_journals", collectionBasis: "completed_payments" } });
  } catch (error) { next(error); }
};
