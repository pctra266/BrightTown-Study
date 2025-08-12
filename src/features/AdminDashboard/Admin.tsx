import React, { useEffect, useState } from "react";
import LeftMenu from "./LeftMenu";
import "./Admin.css";
import { FaBook, FaComments, FaUsers, FaBookOpen } from "react-icons/fa";
import { getFlashcardSets, getAccounts, getBooks, getDiscussions, getSiteStats } from "./adminservice";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const Admin = () => {
  const [stats, setStats] = useState({
    books: 0,
    comments: 0,
    users: 0,
    flashcards: 0
  });

  const [trafficData, setTrafficData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, discussionsRes, accountsRes, flashcardRes, siteStatsRes] = await Promise.all([
          getBooks(),
          getDiscussions(),
          getAccounts(),
          getFlashcardSets(),
          getSiteStats()
        ]);

        setStats({
          books: booksRes.data.length,
          comments: discussionsRes.data.length,
          users: accountsRes.data.length,
          flashcards: flashcardRes.data.length
        });

        setTrafficData(siteStatsRes.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();
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
            <p>BOOK</p>
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
            <FaBookOpen className="stat-icon red mx-auto" />
            <p style={{ fontSize: '50px', color: 'black' }}>{stats.flashcards}</p>
            <p>FLASHCARD SETS</p>
          </div>
        </div>

        <h4>Site Traffic Overview</h4>
        <div style={{ width: "100%", height: 450 }}>
          <ResponsiveContainer>
            <LineChart data={trafficData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#8884d8" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorFlashcards" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#82ca9d" stopOpacity={0.2} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#8884d8' }}
                activeDot={{ r: 6 }}
                name="Total Visits"
              />
              <Line
                type="monotone"
                dataKey="flashcardsStudied"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#82ca9d' }}
                activeDot={{ r: 6 }}
                name="Flashcard learning"
              />
            </LineChart>
          </ResponsiveContainer>

        </div>
      </div>
    </div>
  );
};

export default Admin;
