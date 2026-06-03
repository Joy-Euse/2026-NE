import api from "./api";

export const createItem = async (data) => {
  const response = await api.post("/main", data);
  return response.data;
};

export const getItems = async () => {
  const response = await api.get("/main");
  return response.data;
};

export const getItemById = async (id) => {
  const response = await api.get(`/main/${id}`);
  return response.data;
};

export const updateItem = async (id, data) => {
  const response = await api.put(`/main/${id}`, data);
  return response.data;
};

export const deleteItem = async (id) => {
  const response = await api.delete(`/main/${id}`);
  return response.data;
};
