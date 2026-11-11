/**
 * Purpose: wishlist Api client application module. Main declarations: getWishlist, addWishlist, removeWishlist.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";


/*
|--------------------------------------------------------------------------
| WISHLIST MANAGEMENT
|--------------------------------------------------------------------------
*/


// ============================================================
// GET USER WISHLIST
// GET /api/wishlist
// ============================================================

// Declare getWishlist for use by the surrounding module or function.
export const getWishlist = async () => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/wishlist"
  );

  // Return the value of data to the caller.
  return data;

};




// ============================================================
// ADD TOUR TO WISHLIST
// POST /api/wishlist
// ============================================================

// Declare addWishlist for use by the surrounding module or function.
export const addWishlist = async (tourId) => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post(
    "/wishlist",
    {
      tourId,
    }
  );

  // Return the value of data to the caller.
  return data;

};




// ============================================================
// REMOVE TOUR FROM WISHLIST
// DELETE /api/wishlist/:tourId
// ============================================================

// Declare removeWishlist for use by the surrounding module or function.
export const removeWishlist = async (tourId) => {

  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.delete(
    `/wishlist/${tourId}`
  );

  // Return the value of data to the caller.
  return data;

};
