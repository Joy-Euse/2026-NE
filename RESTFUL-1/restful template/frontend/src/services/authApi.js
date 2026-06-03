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

export const changePassword = async (data) => {
  const response = await api.post("/auth/change-password", data);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email }, { skipAuth: true });
  return response.data;
};

export const verifyResetCode = async (data) => {
  const response = await api.post("/auth/verify-reset-code", data, { skipAuth: true });
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post("/auth/reset-password", data, { skipAuth: true });
  return response.data;
};
