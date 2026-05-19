// src/routes/AppRoutes.tsx

import { Routes, Route } from "react-router-dom";

/* ───────── Pages ───────── */
import Home from "../pages/Home";
import Products from "../pages/Produts";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import NotFound from "../pages/NotFount";
import Lookbook from "../pages/Lookbook";
import About from "../pages/About";
import Contact from "../pages/Contact";

/* ───────── Admin Pages ───────── */
import AdminLogin from "../admin/AdminLogin";
import Admin from "../admin/adminDashbord";
import AdminManageProduct from "../admin/AdminManageProduct";

/* ───────── Split Admin Content Pages ───────── */
import AdminManageLookbook from "../admin/AdminManageLookbook";
import AdminManageAbout from "../admin/AdminManageAbout";
import AdminManageContact from "../admin/AdminManageContact";
import AdminManageHero from "../admin/AdminManageHero";
/* ───────── Protected Route ───────── */
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>

      {/* ───────── Main Routes ───────── */}
      <Route path="/" element={<Home />} />
      <Route path="/product" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/about" element={<About />} />
      <Route path="/lookbook" element={<Lookbook />} />
      <Route path="/contact" element={<Contact />} />

      {/* ───────── Admin Login ───────── */}
      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      {/* ───────── Protected Admin Routes ───────── */}
      <Route element={<ProtectedRoute />}>

        {/* Dashboard */}
        <Route
          path="/admin"
          element={<Admin />}
        />

        {/* Products */}
        <Route
          path="/admin/products"
          element={<AdminManageProduct />}
        />

        {/* Lookbook */}
        <Route
          path="/admin/lookbook"
          element={<AdminManageLookbook />}
        />

        {/* About */}
        <Route
          path="/admin/about"
          element={<AdminManageAbout />}
        />

        {/* Contact */}
        <Route
          path="/admin/contact"
          element={<AdminManageContact />}
        />

        {/* Hero */}
        <Route
          path="/admin/hero"
          element={<AdminManageHero />}
        />

      </Route>

      {/* ───────── 404 ───────── */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}