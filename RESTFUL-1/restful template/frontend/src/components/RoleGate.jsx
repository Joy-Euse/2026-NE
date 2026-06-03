import { useSelector } from "react-redux";

function RoleGate({ roles, children }) {
  const { user } = useSelector((state) => state.auth);
  if (!roles.includes(user?.role)) return null;
  return children;
}

export default RoleGate;
