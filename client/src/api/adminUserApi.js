import api from "./axios";


// GET USERS
export const getAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users", { params });

  return response.data;
};



// UPDATE USER STATUS
export const updateUserStatus = async ({
  id,
  userId,
  status
}) => {
  const resolvedId = id || userId;

  const response = await api.patch(
    `/admin/users/${resolvedId}/status`,
    {
      status
    }
  );

  return response.data;
};



// DELETE USER
export const deleteUser = async (userId) => {

  const response = await api.delete(
    `/admin/users/${userId}`
  );

  return response.data;
};