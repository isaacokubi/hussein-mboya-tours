import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import Review from "../models/Review.js";
import Tour from "../models/Tour.js";

const recalculateTourRating = async (tourId) => {
  const reviews = await Review.find({ tour: tourId, approved: true, isDeleted: false });
  const count = reviews.length;
  const average = count ? reviews.reduce((sum, item) => sum + item.rating, 0) / count : 0;
  await Tour.findByIdAndUpdate(tourId, {
    averageRating: Number(average.toFixed(1)),
    rating: Number(average.toFixed(1)),
    reviewsCount: count,
    totalReviews: count,
  });
};

export const getAdminReviews = async (req, res, next) => {
  requireTenantId();
  try {
    const reviews = await Review.find({ isDeleted: false })
      .populate("user", "name email")
      .populate("tour", "title")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) { next(error); }
};

export const approveAdminReview = async (req, res, next) => {
  try {
    const review = await Review.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    review.approved = true;
    review.rejected = false;
    review.rejectionReason = "";
    await review.save();
    await recalculateTourRating(review.tour);
    res.json({ success: true, review });
  } catch (error) { next(error); }
};

export const rejectAdminReview = async (req, res, next) => {
  try {
    const review = await Review.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    review.approved = false;
    review.rejected = true;
    review.rejectionReason = req.body?.reason || "Rejected by administrator";
    await review.save();
    await recalculateTourRating(review.tour);
    res.json({ success: true, review });
  } catch (error) { next(error); }
};

export const deleteAdminReview = async (req, res, next) => {
  try {
    const review = await Review.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    const tourId = review.tour;
    review.isDeleted = true;
    await review.save();
    await recalculateTourRating(tourId);
    res.json({ success: true, message: "Review deleted" });
  } catch (error) { next(error); }
};
