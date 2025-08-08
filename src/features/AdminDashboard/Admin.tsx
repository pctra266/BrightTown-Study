import React, { useEffect, useState } from "react";
import LeftMenu from "./LeftMenu";
import "./Admin.css";
import { FaBook, FaComments, FaUsers, FaBookOpen } from "react-icons/fa";
import { getFlashcardSets, getAccounts, getBooks, getDiscussions } from "./adminservice";
import { FacebookSharp } from "@mui/icons-material";

const Admin = () => {
  const [stats, setStats] = useState({
    books: 0,
    comments: 0,
    users: 0,
    flashcards: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, discussionsRes, accountsRes, flashcardRes] = await Promise.all([
          getBooks(),
          getDiscussions(),
          getAccounts(),
          getFlashcardSets()
        ]);

        setStats({
          books: booksRes.data.length,
          comments: discussionsRes.data.length,
          users: accountsRes.data.length,
          flashcards: flashcardRes.data.length
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const menu = document.querySelector(".left-menu") as HTMLElement | null;
    const onScroll = () => {
      if (menu) menu.style.top = `${Math.max(0, 63 - window.scrollY)}px`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="admin-container">
      <LeftMenu />
      <div className="main-content">
        <h2>Dashboard</h2>
        <div className="stats">
          <div className="stat-card">
            <FaBook className="stat-icon blue mx-auto" />
            <p style={{ fontSize: '50px', color: 'black' }}>{stats.books}</p>
            <p>SÁCH</p>
          </div>
          <div className="stat-card">
            <FaComments className="stat-icon orange mx-auto" />
            <p style={{ fontSize: '50px', color: 'black' }}>{stats.comments}</p>
            <p>DISCUSSIONS</p>
          </div>
          <div className="stat-card">
            <FaUsers className="stat-icon green mx-auto" />
            <p style={{ fontSize: '50px', color: 'black' }}>{stats.users}</p>
            <p>USERS</p>
          </div>
          <div className="stat-card">
            < FaBookOpen className="stat-icon red mx-auto" />
            <p style={{ fontSize: '50px', color: 'black' }}>{stats.flashcards}</p>
            <p>FLASHCARD SETS</p>
          </div>
        </div>
        <h4>Site Traffic Overview</h4>
        <div className="chart-placeholder"></div>
      </div>
    </div>
  );
};

export default Admin;
