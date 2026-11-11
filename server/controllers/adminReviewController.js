/**
 * Purpose: admin Review Controller HTTP controller. Main declarations: recalculateTourRating, getAdminReviews, approveAdminReview, rejectAdminReview, deleteAdminReview.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Review.js so this module can use its exported dependencies.
import Review from "../models/Review.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";

// Declare recalculateTourRating for use by the surrounding module or function.
const recalculateTourRating = async (tourId) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = requireTenantId();
  // Declare reviews for use by the surrounding module or function.
  const reviews = await Review.find({ tenantId, tour: tourId, approved: true, isDeleted: false });
  // Declare count for use by the surrounding module or function.
  const count = reviews.length;
  // Declare average for use by the surrounding module or function.
  const average = count ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / count : 0;

  // Perform the side effect or state update expressed on the following line.
  await Tour.findOneAndUpdate(
    mergeTenantFilter({ _id: tourId }),
    {
      $set: {
        averageRating: Number(average.toFixed(1)),
        rating: Number(average.toFixed(1)),
        reviewsCount: count,
        totalReviews: count,
      },
    },
    { runValidators: true }
  );
};

// Declare getAdminReviews for use by the surrounding module or function.
export const getAdminReviews = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare reviews for use by the surrounding module or function.
    const reviews = await Review.find(
      mergeTenantFilter({ tenantId, isDeleted: false })
    )
      .populate("user", "name email profileImage")
      .populate("customer", "name email profileImage")
      .populate("tour", "title")
      .sort({ createdAt: -1 })
      .lean();

    // Return the result of res.json() to the caller.
    return res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare approveAdminReview for use by the surrounding module or function.
export const approveAdminReview = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare review for use by the surrounding module or function.
    const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));
    // Check the condition (!review) and run the matching branch.
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    // Perform the side effect or state update expressed on the following line.
    review.approved = true;
    // Perform the side effect or state update expressed on the following line.
    review.rejected = false;
    // Perform the side effect or state update expressed on the following line.
    review.rejectionReason = "";
    // Perform the side effect or state update expressed on the following line.
    await review.save();
    // Perform the side effect or state update expressed on the following line.
    await recalculateTourRating(review.tour);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, review });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare rejectAdminReview for use by the surrounding module or function.
export const rejectAdminReview = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare review for use by the surrounding module or function.
    const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));
    // Check the condition (!review) and run the matching branch.
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    // Perform the side effect or state update expressed on the following line.
    review.approved = false;
    // Perform the side effect or state update expressed on the following line.
    review.rejected = true;
    // Perform the side effect or state update expressed on the following line.
    review.rejectionReason = req.body?.reason || "Rejected by administrator";
    // Perform the side effect or state update expressed on the following line.
    await review.save();
    // Perform the side effect or state update expressed on the following line.
    await recalculateTourRating(review.tour);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, review });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare deleteAdminReview for use by the surrounding module or function.
export const deleteAdminReview = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare review for use by the surrounding module or function.
    const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));
    // Check the condition (!review) and run the matching branch.
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    // Declare tourId for use by the surrounding module or function.
    const tourId = review.tour;
    // Perform the side effect or state update expressed on the following line.
    review.isDeleted = true;
    // Perform the side effect or state update expressed on the following line.
    await review.save();
    // Perform the side effect or state update expressed on the following line.
    await recalculateTourRating(tourId);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};
