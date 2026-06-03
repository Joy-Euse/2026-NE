import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ allowedRoles, children }) {
  const { accessToken, user } = useSelector((state) => state.auth);

  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/dashboard" replace />;

  return children;
}

export default ProtectedRoute;
