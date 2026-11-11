/**
 * Purpose: recommendation Controller HTTP controller. Main declarations: getRecommendations.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../services/recommendationService.js so this module can use its exported dependencies.
import { recommendTours } from "../services/recommendationService.js";

/*
|--------------------------------------------------------------------------
| GET TOUR RECOMMENDATIONS
|--------------------------------------------------------------------------
| POST /api/recommendations
|--------------------------------------------------------------------------
*/

// Declare getRecommendations for use by the surrounding module or function.
export const getRecommendations = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare preferences for use by the surrounding module or function.
    const preferences = req.body;

    // Check the condition (!preferences || Object.keys(preferences).length === 0) and run the matching branch.
    if (!preferences || Object.keys(preferences).length === 0) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Recommendation criteria are required.",
      });
    }

    // Declare tours for use by the surrounding module or function.
    const tours = await recommendTours(preferences);

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      count: tours?.length || 0,
      recommendations: tours || [],
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("GET RECOMMENDATIONS ERROR:", error);
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
