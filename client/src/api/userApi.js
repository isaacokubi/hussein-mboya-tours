import api from "./axios";

export const getProfile = async () => {
  const { data } = await api.get("/users/profile");
  return data;
};

export const getAll = getProfile;
