
import React from "react";
import { NavLink, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
const LeftMenu = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "2") {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="left-menu">
      <NavLink to="/admin" end className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
        Dashboard
      </NavLink>
      <NavLink to="/admin/users" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
        Manage User
      </NavLink>
      <NavLink to="/admin/flashcards" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
        Manage Flashcard
      </NavLink>
      <NavLink to="/admin/recycle" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
        Recyle Bin
      </NavLink>
      <NavLink to="/ui-elements" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
        Approve Request
      </NavLink>
    </div>
  );
};


export default LeftMenu;
