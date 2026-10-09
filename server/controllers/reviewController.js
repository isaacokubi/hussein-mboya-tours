import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";

const updateTourRating = async (tourId) => {
  const tenantId = requireTenantId();
  const reviews = await Review.find({ tenantId, tour: tourId, approved: true });
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0;
  await Tour.findOneAndUpdate(
    mergeTenantFilter({ _id: tourId }),
    { $set: { averageRating: Number(averageRating.toFixed(1)), rating: Number(averageRating.toFixed(1)), reviewsCount: totalReviews, totalReviews } },
    { runValidators: true }
  );
};

export const listPublicTestimonials = async (req, res, next) => {
  try {
    const reviews = await Review.find(mergeTenantFilter({
      approved: true,
      verified: true,
      publicConsent: true,
      isDeleted: false,
    }))
      .select("rating title comment publicConsent verified createdAt user tour")
      .populate("user", "name")
      .populate("tour", "title")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const testimonials = reviews
      .filter((review) => review.publicConsent === true && review.verified === true)
      .map((review) => ({
        _id: review._id,
        name: review.user?.name || "Traveler",
        text: review.comment,
        rating: Number(review.rating || 0),
        tourTitle: review.tour?.title || "",
        createdAt: review.createdAt,
        verified: true,
        publicConsent: true,
      }));

    return res.status(200).json({ success: true, count: testimonials.length, testimonials });
  } catch (error) {
    return next(error);
  }
};

export const createReview = async (req, res, next) => {
  requireTenantId();
  try {
    const { tour: requestedTour, tourId, rating, title, comment, publicConsent } = req.body;
    const tour = requestedTour || tourId;
    if (!tour || !rating || !comment) return res.status(400).json({ success: false, message: "Tour, rating and comment are required." });

    const booking = await Booking.findOne(mergeTenantFilter({
      tour,
      status: "completed",
      $or: [
        { user: req.user._id },
        { customer: req.user._id },
        { "customerSnapshot.email": req.user.email },
      ],
    }));
    if (!booking) return res.status(400).json({ success: false, message: "Only completed tours can be reviewed." });

    const existingReview = await Review.findOne(mergeTenantFilter({ user: req.user._id, tour }));
    if (existingReview) return res.status(409).json({ success: false, message: "You have already reviewed this tour." });

    const review = await Review.create({
      tenantId: req.tenantId,
      user: req.user._id,
      booking: booking._id,
      tour,
      rating,
      title,
      comment,
      verified: true,
      publicConsent: publicConsent === true,
      publicConsentAt: publicConsent === true ? new Date() : null,
      approved: false,
      helpfulVotes: 0,
    });
    return res.status(201).json({ success: true, message: "Review submitted successfully and is awaiting approval.", review });
  } catch (error) { console.error("CREATE REVIEW ERROR:", error); next(error); }
};

export const getTourReviews = async (req, res, next) => {
  requireTenantId();
  try {
    const reviews = await Review.find(mergeTenantFilter({ tour: req.params.id, approved: true, verified: true, publicConsent: true, isDeleted: false }))
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) { console.error("GET TOUR REVIEWS ERROR:", error); next(error); }
};

export const approveReview = async (req, res, next) => {
  requireTenantId();
  try {
    const review = await Review.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    review.approved = true;
    await review.save();
    await updateTourRating(review.tour);
    return res.status(200).json({ success: true, message: "Review approved successfully.", review });
  } catch (error) { console.error("APPROVE REVIEW ERROR:", error); next(error); }
};

export const voteHelpful = async (req, res, next) => {
  requireTenantId();
  try {
    const review = await Review.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    review.helpfulVotes += 1;
    await review.save();
    return res.status(200).json({ success: true, helpfulVotes: review.helpfulVotes });
  } catch (error) { console.error("VOTE HELPFUL ERROR:", error); next(error); }
};

export const deleteReview = async (req, res, next) => {
  requireTenantId();
  try {
    const review = await Review.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    const tourId = review.tour;
    await review.deleteOne();
    await updateTourRating(tourId);
    return res.status(200).json({ success: true, message: "Review deleted successfully." });
  } catch (error) { console.error("DELETE REVIEW ERROR:", error); next(error); }
};
