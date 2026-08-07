import api from "./axios";


// GET USERS
export const getAdminUsers = async () => {
  const response = await api.get("/admin/users");

  return response.data;
};



// UPDATE USER STATUS
export const updateUserStatus = async ({
  userId,
  status
}) => {

  const response = await api.patch(
    `/admin/users/${userId}/status`,
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