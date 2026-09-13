import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Review from "../models/Review.js";
import Tour from "../models/Tour.js";

const recalculateTourRating = async (tourId) => {
  const tenantId = requireTenantId();
  const reviews = await Review.find({ tenantId, tour: tourId, approved: true, isDeleted: false });
  const count = reviews.length;
  const average = count ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / count : 0;

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

export const getAdminReviews = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const reviews = await Review.find(
      mergeTenantFilter({ tenantId, isDeleted: false })
    )
      .populate("user", "name email profileImage")
      .populate("customer", "name email profileImage")
      .populate("tour", "title")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return next(error);
  }
};

export const approveAdminReview = async (req, res, next) => {
  try {
    const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    review.approved = true;
    review.rejected = false;
    review.rejectionReason = "";
    await review.save();
    await recalculateTourRating(review.tour);
    return res.json({ success: true, review });
  } catch (error) {
    return next(error);
  }
};

export const rejectAdminReview = async (req, res, next) => {
  try {
    const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    review.approved = false;
    review.rejected = true;
    review.rejectionReason = req.body?.reason || "Rejected by administrator";
    await review.save();
    await recalculateTourRating(review.tour);
    return res.json({ success: true, review });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminReview = async (req, res, next) => {
  try {
    const review = await Review.findOne(mergeTenantFilter({ _id: req.params.id }));
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    const tourId = review.tour;
    review.isDeleted = true;
    await review.save();
    await recalculateTourRating(tourId);
    return res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    return next(error);
  }
};
