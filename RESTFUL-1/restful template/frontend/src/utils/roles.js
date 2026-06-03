export const ROLES = {
  ADMIN: "ADMIN",
  INSPECTOR: "INSPECTOR",
  USER: "USER",
};

export const canAccess = (role, allowed) => allowed.includes(role);

export const fullName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "User";
