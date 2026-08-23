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

export const getWishlist = async () => {

  const { data } = await api.get(
    "/wishlist"
  );

  return data;

};




// ============================================================
// ADD TOUR TO WISHLIST
// POST /api/wishlist
// ============================================================

export const addWishlist = async (tourId) => {

  const { data } = await api.post(
    "/wishlist",
    {
      tourId,
    }
  );

  return data;

};




// ============================================================
// REMOVE TOUR FROM WISHLIST
// DELETE /api/wishlist/:tourId
// ============================================================

export const removeWishlist = async (tourId) => {

  const { data } = await api.delete(
    `/wishlist/${tourId}`
  );

  return data;

};
