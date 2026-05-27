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
import ClientProjects from "../pages/ClientProjects";
import TermsAndConditions from "../pages/TermsAndConditions";

/* ───────── User Auth ───────── */
import UserAuth from "../Auth/UserAuth";
import UserProfile from "../Auth/UserProfile";

/* ───────── Admin Pages ───────── */
import AdminLogin from "../admin/AdminLogin";
import Admin from "../admin/adminDashbord";
import AdminManageProduct from "../admin/AdminManageProduct";

/* ───────── Split Admin Content Pages ───────── */
import AdminManageLookbook from "../admin/AdminManageLookbook";
import AdminManageAbout from "../admin/AdminManageAbout";
import AdminManageContact from "../admin/AdminManageContact";
import AdminManageHero from "../admin/AdminManageHero";
import AdminManageClientProjects from "../admin/AdminManageClientProjects";

/* ───────── Protected Routes ───────── */
import ProtectedRoute from "../components/ProtectedRoute";           // admin
import UserProtectedRoute from "../components/UserProtectedRoute";   // user

export default function AppRoutes() {
  return (
    <Routes>

      {/* ───────── Public Routes ───────── */}
      <Route path="/"              element={<Home />} />
      <Route path="/product"       element={<Products />} />
      <Route path="/products/:id"  element={<ProductDetail />} />
      <Route path="/cart"          element={<Cart />} />
      <Route path="/about"         element={<About />} />
      <Route path="/lookbook"      element={<Lookbook />} />
      <Route path="/contact"       element={<Contact />} />
      <Route path="/ClientProjects" element={<ClientProjects />} />
      <Route path="/terms"         element={<TermsAndConditions />} />

      {/* ───────── User Login / Register ───────── */}
      <Route path="/login" element={<UserAuth />} />

      {/* ───────── Protected User Routes ───────── */}
      <Route element={<UserProtectedRoute />}>
        {/* add more user pages here as you build them */}
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      {/* ───────── Admin Login ───────── */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ───────── Protected Admin Routes ───────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin"                element={<Admin />} />
        <Route path="/admin/products"       element={<AdminManageProduct />} />
        <Route path="/admin/lookbook"       element={<AdminManageLookbook />} />
        <Route path="/admin/about"          element={<AdminManageAbout />} />
        <Route path="/admin/contact"        element={<AdminManageContact />} />
        <Route path="/admin/hero"           element={<AdminManageHero />} />
        <Route path="/admin/client-projects" element={<AdminManageClientProjects />} />
      </Route>

      {/* ───────── 404 ───────── */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}