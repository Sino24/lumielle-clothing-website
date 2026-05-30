// src/admin/AdminLayout.tsx

import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavBar from "../admin/AdminNavbar";

const AdminLayout: React.FC = () => {
  return (
    <>
      <AdminNavBar />
      <div style={{ paddingTop: "calc(var(--nav-height) + 56px)" }}>
        <Outlet />
      </div>
    </>
  );
};

export default AdminLayout;