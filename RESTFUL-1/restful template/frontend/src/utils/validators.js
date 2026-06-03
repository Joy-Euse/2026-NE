export const isEmail = (value) => /\S+@\S+\.\S+/.test(value);

export const required = (value) => String(value || "").trim().length > 0;

export const dateAfter = (end, start) => {
  if (!end || !start) return true;
  return new Date(end) > new Date(start);
};

export const passwordValid = (value) => String(value || "").length >= 8;
