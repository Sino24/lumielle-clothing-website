// src/routes/AppRoutes.tsx

import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Products from "../pages/Produts";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";

import NotFound from "../pages/NotFount";
import Lookbook  from "../pages/Lookbook";
import About  from "../pages/About";
import Contact from "../pages/Contact";
import AdminLogin from "../admin/AdminLogin";
import Admin from "../admin/admin";
import AdminManageProduct from "../admin/AdminManageProduct";
import AdminManageContent from "../admin/AdminManageContent";
export default function AppRoutes() {
  return (
    <Routes>

      {/* ── Main Routes ───────────────────────── */}
      <Route path="/" element={<Home />} />

      <Route path="/product" element={<Products />} />

      <Route
        path="/products/:id"
        element={<ProductDetail />}
      />

      <Route path="/cart" element={<Cart />} />

      {/* ── Admin Routes ─────────────────────── */}
      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      <Route
        path="/admin"
        element={<Admin />}
      />

      <Route
        path="/admin/products"
        element={<AdminManageProduct />}
      />

      {/* ── 404 ──────────────────────────────── */}
      <Route
        path="*"
        element={<NotFound />}
      />

      <Route path="/about" element={<About />} />
      <Route path="/lookbook" element={<Lookbook />} />
     <Route path="/contact" element={<Contact />} />
       <Route path="/admin/content" element={<AdminManageContent />} />

    </Routes>



  );
}