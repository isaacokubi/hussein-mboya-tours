/**
 * Purpose: review Controller HTTP controller. Main declarations: updateTourRating, createReview, getTourReviews, approveReview, voteHelpful.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Review.js so this module can use its exported dependencies.
import Review from "../models/Review.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";

// Declare updateTourRating for use by the surrounding module or function.
const updateTourRating = async (tourId) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = requireTenantId();
  // Declare reviews for use by the surrounding module or function.
  const reviews = await Review.find({ tenantId, tour: tourId, approved: true });
  // Declare totalReviews for use by the surrounding module or function.
  const totalReviews = reviews.length;
  // Declare averageRating for use by the surrounding module or function.
  const averageRating = totalReviews > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0;
  // Perform the side effect or state update expressed on the following line.
  await Tour.findOneAndUpdate(
    mergeTenantFilter({ _id: tourId }),
    { $set: { averageRating: Number(averageRating.toFixed(1)), rating: Number(averageRating.toFixed(1)), reviewsCount: totalReviews, totalReviews } },
    { runValidators: true }
  );
};

// Declare createReview for use by the surrounding module or function.
export const createReview = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { tour: requestedTour, tourId, rating, title, comment } for use by the surrounding module or function.
    const { tour: requestedTour, tourId, rating, title, comment } = req.body;
    // Declare tour for use by the surrounding module or function.
    const tour = requestedTour || tourId;
    // Check the condition (!tour || !rating || !comment) and run the matching branch.
    if (!tour || !rating || !comment) return res.status(400).json({ success: false, message: "Tour, rating and comment are required." });

    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(mergeTenantFilter({
      tour,
      status: "completed",
      $or: [
        { user: req.user._id },
        { customer: req.user._id },
        { "customerSnapshot.email": req.user.email },
      ],
    }));
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return res.status(400).json({ success: false, message: "Only completed tours can be reviewed." });

    // Declare existingReview for use by the surrounding module or function.
    const existingReview = await Review.findOne(mergeTenantFilter({ user: req.user._id, tour }));
    // Check the condition (existingReview) and run the matching branch.
    if (existingReview) return res.status(409).json({ success: false, message: "You have already reviewed this tour." });

    // Declare review for use by the surrounding module or function.
    const review = await Review.create({
      tenantId: req.tenantId,
      user: req.user._id,
      booking: booking._id,
      tour,
      rating,
      title,
      comment,
      verified: true,
      approved: false,
      helpfulVotes: 0,
    });
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, message: "Review submitted successfully and is awaiting approval.", review });
  } catch (error) { console.error("CREATE REVIEW ERROR:", error); next(error); }
};

// Declare getTourReviews for use by the surrounding module or function.
export const getTourReviews = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare reviews for use by the surrounding module or function.
    const reviews = await Review.find(mergeTenantFilter({ tour: req.params.id, approved: true, isDeleted: false }))
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) { console.error("GET TOUR REVIEWS ERROR:", error); next(error); }
};

// Declare approveReview for use by the surrounding module or function.
export const approveReview = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare review for use by the surrounding module or function.
    const review = await Review.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!review) and run the matching branch.
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    // Perform the side effect or state update expressed on the following line.
    review.approved = true;
    // Perform the side effect or state update expressed on the following line.
    await review.save();
    // Perform the side effect or state update expressed on the following line.
    await updateTourRating(review.tour);
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Review approved successfully.", review });
  } catch (error) { console.error("APPROVE REVIEW ERROR:", error); next(error); }
};

// Declare voteHelpful for use by the surrounding module or function.
export const voteHelpful = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare review for use by the surrounding module or function.
    const review = await Review.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!review) and run the matching branch.
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    // Perform the side effect or state update expressed on the following line.
    review.helpfulVotes += 1;
    // Perform the side effect or state update expressed on the following line.
    await review.save();
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, helpfulVotes: review.helpfulVotes });
  } catch (error) { console.error("VOTE HELPFUL ERROR:", error); next(error); }
};

// Declare deleteReview for use by the surrounding module or function.
export const deleteReview = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare review for use by the surrounding module or function.
    const review = await Review.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!review) and run the matching branch.
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    // Declare tourId for use by the surrounding module or function.
    const tourId = review.tour;
    // Perform the side effect or state update expressed on the following line.
    await review.deleteOne();
    // Perform the side effect or state update expressed on the following line.
    await updateTourRating(tourId);
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Review deleted successfully." });
  } catch (error) { console.error("DELETE REVIEW ERROR:", error); next(error); }
};
