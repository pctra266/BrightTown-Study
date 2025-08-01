import React, { useEffect } from "react";
import LeftMenu from './LeftMenu.jsx';
import "./Admin.css";
import { FaShoppingCart, FaComments, FaUsers, FaSearch } from "react-icons/fa";

const Admin = () => {

  useEffect(() => {
    const menu = document.querySelector('.left-menu');

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const offset = Math.max(0, 63 - scrollY);
      if (menu) {
        menu.style.top = `${offset}px`;
      }
    };
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div className="admin-container">
        <LeftMenu />
      <div className="main-content">
        <h2>Dashboard</h2>
        <div className="stats">
          <div className="stat-card">
            <FaShoppingCart className="stat-icon blue mx-auto" />
            <p style={{ fontSize: '50px', color: 'black' }}>120</p>
            <p>NEW ORDERS</p>
          </div>
          <div className="stat-card">
            <FaComments className="stat-icon orange mx-auto" />
            <p style={{ fontSize: '50px', color: 'black' }}>52</p>
            <p>COMMENTS</p>
          </div>
          <div className="stat-card">
            <FaUsers className="stat-icon green mx-auto" />
            <p style={{ fontSize: '50px', color: 'black' }}>24</p>
            <p>NEW USERS</p>
          </div>
          <div className="stat-card">
            <FaSearch className="stat-icon red mx-auto" />
            <p style={{ fontSize: '50px', color: 'black' }}>25.2k</p>
            <p>PAGE VIEWS</p>
          </div>
        </div>
        <h4>Site Traffic Overview</h4>
        <div className="chart-placeholder"></div>
      </div>
      
    </div>
  );
};

export default Admin;
