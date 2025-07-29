// src/components/LeftMenu.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const LeftMenu = () => {
  return (
    <div className="left-menu">
      <NavLink to="/admin" className="menu-item" >Dashboard</NavLink>
      <NavLink to="/manageuser" className="menu-item" >Manage User</NavLink>
      <NavLink to="/charts" className="menu-item" >Charts</NavLink>
      <NavLink to="/ui-elements" className="menu-item" >UI Elements</NavLink>
      <NavLink to="/alerts" className="menu-item" >Alerts & Panels</NavLink>
      <NavLink to="/logout" className="menu-item">Logout</NavLink>
    </div>
  );
};

export default LeftMenu;
