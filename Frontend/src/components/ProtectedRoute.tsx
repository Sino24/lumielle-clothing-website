import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem("adminToken");

  return token
    ? <Outlet />
    : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;