import api from "./api";

export const getOwnProfile = async () => (await api.get("/users/me")).data.data;
export const updateOwnProfile = async (data) => (await api.put("/users/me", data)).data.data;
export const getUsers = async (params) => (await api.get("/users", { params })).data;
export const getUserById = async (id) => (await api.get(`/users/${id}`)).data.data;
export const updateUser = async (id, data) => (await api.put(`/users/${id}`, data)).data.data;
export const changeUserRole = async (id, role) => (await api.patch(`/users/${id}/role`, { role })).data.data;
export const changeUserStatus = async (id, status) => (await api.patch(`/users/${id}/status`, { status })).data.data;
export const deactivateUser = async (id) => (await api.delete(`/users/${id}`)).data.data;
