// src/admin/AdminNavbar.tsx

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdOutlineCheckroom,
  MdAutoStories,
  MdInfoOutline,
  MdMailOutline,
  MdMovieCreation,
  MdWorkOutline,
  MdPeopleOutline,
  MdInventory2,
  MdMenu,
  MdClose,
} from "react-icons/md";
import "../styles/AdminStyle/AdminNavbar.css";

const NAV_ITEMS = [
  { path: "/admin",                 label: "Dashboard", icon: MdDashboard        },
  { path: "/admin/products",        label: "Products",  icon: MdOutlineCheckroom },
  { path: "/admin/lookbook",        label: "Lookbook",  icon: MdAutoStories      },
  { path: "/admin/about",           label: "About",     icon: MdInfoOutline      },
  { path: "/admin/contact",         label: "Messages",  icon: MdMailOutline      },
  { path: "/admin/hero",            label: "Hero",      icon: MdMovieCreation    },
  { path: "/admin/client-projects", label: "Projects",  icon: MdWorkOutline      },
  { path: "/admin/users",           label: "Users",     icon: MdPeopleOutline    },
  { path: "/admin/orders",          label: "Orders",    icon: MdInventory2       },
];

const AdminNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="anb">
        <div className="anb-inner">

       

          {/* Desktop links */}
          <div className="anb-links">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  className={`anb-link${isActive(item.path) ? " active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="anb-link-icon" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Hamburger */}
          <button className="anb-burger" onClick={() => setOpen((v) => !v)}>
            {open ? <MdClose size={22} /> : <MdMenu size={22} />}
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      {open && (
        <div className="anb-backdrop" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer — sits below BOTH navbars */}
      <div className={`anb-drawer${open ? " open" : ""}`}>
  

        <div className="anb-drawer-links">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                className={`anb-drawer-link${isActive(item.path) ? " active" : ""}`}
                onClick={() => { navigate(item.path); setOpen(false); }}
              >
                <Icon size={18} className="anb-drawer-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default AdminNavBar;