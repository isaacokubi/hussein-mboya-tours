import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import Commission from "../models/Commission.js";
import User from "../models/User.js";
import { getPostedRevenueReport } from "../services/financeReportingService.js";

const PAYMENT_STATUSES = ["pending", "completed", "failed", "cancelled", "refunded"];
const TRANSACTION_PAGE_SIZE = 10;
const tenantPaymentFilter = (status) => mergeTenantFilter({ status });
const tenantBookingFilter = (extra = {}) => mergeTenantFilter(extra);

export const getFinanceStats = async (req, res, next) => { requireTenantId(); try { const [revenueReport, completedPayments, pendingPayments, failedPayments, refundedPayments, refundedAmountResult, paidBookings, commissionResult] = await Promise.all([getPostedRevenueReport(), Payment.countDocuments(tenantPaymentFilter("completed")), Payment.countDocuments(tenantPaymentFilter("pending")), Payment.countDocuments(tenantPaymentFilter("failed")), Payment.countDocuments(tenantPaymentFilter("refunded")), Payment.aggregate([{ $match: mergeTenantFilter({ refundedAmount: { $gt: 0 } }) }, { $group: { _id: null, total: { $sum: { $ifNull: ["$refundedAmount", 0] } } } }]), Booking.countDocuments(tenantBookingFilter({ paymentStatus: "paid" })), Commission.aggregate([{ $match: mergeTenantFilter({}) }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }])]); const revenue = Number(revenueReport.total || 0); const refundedAmount = Number(refundedAmountResult[0]?.total || 0); const collectionsResult = await Payment.aggregate([{ $match: tenantPaymentFilter("completed") }, { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } }]); const collections = Number(collectionsResult[0]?.total || 0); return res.status(200).json({ success: true, data: { revenue, netRevenue: revenue, collections, netCollections: Math.max(0, collections - refundedAmount), refundedAmount, completedPayments, pendingPayments, failedPayments, refundedPayments, paidBookings, commission: commissionResult[0]?.total || 0, revenueBasis: "posted_journals", collectionBasis: "completed_payments" } }); } catch (error) { next(error); } };

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
    const revenueReport = await getPostedRevenueReport({ from: from ? `${from}T00:00:00.000Z` : undefined, to: to ? `${to}T23:59:59.999Z` : undefined });
    const monthlyRevenue = revenueReport.monthly;
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
