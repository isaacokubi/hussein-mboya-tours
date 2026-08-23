import api from "./axios";

import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const getProfile = async () => {
  const token = localStorage.getItem("token");

  return axios.get(
    `${API}/users/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};



/*
 Auto completed API helpers
*/

export const getAll = async()=>{
    const {data}=await api.get("/users/profile");
    return data;
};
