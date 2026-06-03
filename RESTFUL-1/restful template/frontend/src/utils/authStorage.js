const KEY = "fems.auth";

export const loadAuth = () => {
  try {
    localStorage.removeItem("token");
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};

export const saveAuth = (data) => {
  localStorage.setItem(KEY, JSON.stringify(data));
};

export const clearAuth = () => {
  localStorage.removeItem(KEY);
};
