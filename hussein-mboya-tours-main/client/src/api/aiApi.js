// client/src/services/aiService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| ASK TRAVEL AI
|--------------------------------------------------------------------------
*/

export const askTravelAI = async (
  message,
  context = {}
) => {
  const { data } = await api.post(
    "/ai/assistant",
    {
      message,
      ...context,
    }
  );

  return data;
};