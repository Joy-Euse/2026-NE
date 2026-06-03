import api from "./api";

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data.data;
};

export const signupUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data.data;
};

export const logoutUser = async (refreshToken) => {
  const response = await api.post("/auth/logout", { refreshToken });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/users/me");
  return response.data.data;
};
