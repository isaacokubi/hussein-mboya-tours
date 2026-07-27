import api from "./axios";

export const initiateMpesa = async (data) => {
  const response = await api.post("/mpesa/stkpush", data);

  return response.data;
};
