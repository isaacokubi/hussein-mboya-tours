import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";

/*
|--------------------------------------------------------------------------
| RECALCULATE TOUR RATING
|--------------------------------------------------------------------------
*/

const updateTourRating = async (tourId) => {
  const reviews = await Review.find({
    tour: tourId,
    approved: true,
  });

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

  await Tour.findByIdAndUpdate(tourId, {
    averageRating: Number(averageRating.toFixed(1)),
    rating: Number(averageRating.toFixed(1)),
    reviewsCount: totalReviews,
    totalReviews,
  });
};

/*
|--------------------------------------------------------------------------
| CREATE REVIEW
|--------------------------------------------------------------------------
*/

export const createReview = async (req, res, next) => {
  try {
    const {
      tour: requestedTour,
      tourId,
      rating,
      title,
      comment,
    } = req.body;

    const tour = requestedTour || tourId;

    if (!tour || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Tour, rating and comment are required.",
      });
    }

    const booking = await Booking.findOne({
      tour,
      status: "completed",
      $or: [
        { user: req.user._id },
        { customer: req.user._id },
        { "customerSnapshot.email": req.user.email },
      ],
    });

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "Only completed tours can be reviewed.",
      });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      tour,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this tour.",
      });
    }

    const review = await Review.create({
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

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully and is awaiting approval.",
      review,
    });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET TOUR REVIEWS
|--------------------------------------------------------------------------
*/

export const getTourReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      tour: req.params.id,
      approved: true,
      isDeleted: false,
    })
      .populate(
        "user",
        "name profileImage"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("GET TOUR REVIEWS ERROR:", error);
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| APPROVE REVIEW
|--------------------------------------------------------------------------
*/

export const approveReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    review.approved = true;

    await review.save();

    await updateTourRating(review.tour);

    return res.status(200).json({
      success: true,
      message: "Review approved successfully.",
      review,
    });
  } catch (error) {
    console.error("APPROVE REVIEW ERROR:", error);
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| MARK REVIEW HELPFUL
|--------------------------------------------------------------------------
*/

export const voteHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    review.helpfulVotes += 1;

    await review.save();

    return res.status(200).json({
      success: true,
      helpfulVotes: review.helpfulVotes,
    });
  } catch (error) {
    console.error("VOTE HELPFUL ERROR:", error);
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE REVIEW
|--------------------------------------------------------------------------
*/

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    const tourId = review.tour;

    await review.deleteOne();

    await updateTourRating(tourId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);
    next(error);
  }
};