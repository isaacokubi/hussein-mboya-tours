import api from "./axios";


// GET USERS
export const getAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users", { params });

  return response.data;
};


// UPDATE USER STATUS
export const updateUserStatus = async ({ id, status }) => {
  if (!id) {
    throw new Error("User ID is required");
  }

  const response = await api.put(
    `/admin/users/${id}/status`,
    {
      status,
    }
  );

  return response.data;
};


// DELETE USER
export const deleteUser = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const response = await api.delete(
    `/admin/users/${userId}`
  );

  return response.data;
};
