import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FireExtinguishers from "./pages/FireExtinguishers";
import ExtinguisherDetails from "./pages/ExtinguisherDetails";
import Inspections from "./pages/Inspections";
import Maintenance from "./pages/Maintenance";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import ProtectedRoute from "./components/ProtectedRoute";

const routes = [
  { path: "/dashboard", element: <Dashboard />, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { path: "/extinguishers", element: <FireExtinguishers />, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { path: "/extinguishers/:id", element: <ExtinguisherDetails />, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { path: "/inspections", element: <Inspections />, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { path: "/maintenance", element: <Maintenance />, roles: ["ADMIN", "INSPECTOR"] },
  { path: "/notifications", element: <Notifications />, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { path: "/reports", element: <Reports />, roles: ["ADMIN", "INSPECTOR"] },
  { path: "/users", element: <Users />, roles: ["ADMIN"] },
];

function App() {
  const { accessToken, user } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(accessToken && user);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/signup" element={<Navigate to="/register" replace />} />
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<ProtectedRoute allowedRoles={route.roles}>{route.element}</ProtectedRoute>}
          />
        ))}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
