import axios from "axios";

/*
|--------------------------------------------------------------------------
| AXIOS INSTANCE
|--------------------------------------------------------------------------
*/

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

/*
|--------------------------------------------------------------------------
| INITIATE MPESA STK PUSH
|--------------------------------------------------------------------------
*/

export const initiateMpesa = async (data) => {
  const response = await API.post(
    "/api/mpesa/stkpush",

    data,
  );

  return response.data;
};

export default API;
