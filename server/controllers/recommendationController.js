import { recommendTours } from "../services/recommendationService.js";

/*
|--------------------------------------------------------------------------
| GET TOUR RECOMMENDATIONS
|--------------------------------------------------------------------------
| POST /api/recommendations
|--------------------------------------------------------------------------
*/

export const getRecommendations = async (req, res, next) => {
  try {
    const preferences = req.body;

    if (!preferences || Object.keys(preferences).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Recommendation criteria are required.",
      });
    }

    const tours = await recommendTours(preferences);

    return res.status(200).json({
      success: true,
      count: tours?.length || 0,
      recommendations: tours || [],
    });
  } catch (error) {
    console.error("GET RECOMMENDATIONS ERROR:", error);
    next(error);
  }
};