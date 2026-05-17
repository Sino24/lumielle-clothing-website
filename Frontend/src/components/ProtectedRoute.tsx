// src/components/ProtectedRoute.tsx

import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Wraps admin routes. Redirects to /admin/auth if no token found.
 *
 * Usage in your router:
 *
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/admin" element={<AdminDashboard />} />
 *     <Route path="/admin/products" element={<ProductManage />} />
 *   </Route>
 *   <Route path="/admin/auth" element={<AdminAuth />} />
 */
const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem("adminToken");
  return token ? <Outlet /> : <Navigate to="/admin/auth" replace />;
};

export default ProtectedRoute;