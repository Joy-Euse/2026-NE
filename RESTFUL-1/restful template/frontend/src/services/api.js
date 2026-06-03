import axios from "axios";
import { clearAuth, loadAuth, saveAuth } from "../utils/authStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

const cleanParams = (params) => {
  if (!params) return params;
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );
};

api.interceptors.request.use((config) => {
  const { accessToken } = loadAuth();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  config.params = cleanParams(config.params);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const { refreshToken } = loadAuth();

    if (error.response?.status === 401 && refreshToken && !original?._retry) {
      original._retry = true;
      try {
        const response = await api.post("/auth/refresh", { refreshToken });
        const current = loadAuth();
        saveAuth({ ...current, ...response.data.data });
        original.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
        return api(original);
      } catch {
        clearAuth();
      }
    }

    return Promise.reject(error);
  }
);

export const apiError = (error) =>
  error.response?.data?.error?.message || error.response?.data?.message || error.message || "Request failed";

export default api;
