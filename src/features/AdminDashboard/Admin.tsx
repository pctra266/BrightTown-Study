import React, { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { FaBook, FaComments, FaUsers, FaBookOpen } from "react-icons/fa";
import LeftMenu from "./LeftMenu";
import { getFlashcardSets, getAccounts, getBooks, getDiscussions, getSiteStats } from "./adminservice";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Admin = () => {
  const [stats, setStats] = useState({ books: 0, comments: 0, users: 0, flashcards: 0 });
  const [trafficData, setTrafficData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, discussionsRes, accountsRes, flashcardRes, siteStatsRes] = await Promise.all([
          getBooks(),
          getDiscussions(),
          getAccounts(),
          getFlashcardSets(),
          getSiteStats(),
        ]);

        setStats({
          books: booksRes.data.length,
          comments: discussionsRes.data.length,
          users: accountsRes.data.length,
          flashcards: flashcardRes.data.length,
        });

        setTrafficData(siteStatsRes.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { icon: <FaBook style={{ fontSize: 25, color: "#2196f3",margin:'auto' }} />, value: stats.books, label: "BOOK" },
    { icon: <FaComments style={{ fontSize: 25, color: "#ff9800",margin:'auto' }} />, value: stats.comments, label: "DISCUSSIONS" },
    { icon: <FaUsers style={{ fontSize: 25, color: "#4caf50",margin:'auto' }} />, value: stats.users, label: "USERS" },
    { icon: <FaBookOpen style={{ fontSize: 25, color: "#f44336",margin:'auto' }} />, value: stats.flashcards, label: "FLASHCARD SETS" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <LeftMenu />
      <Box
        sx={{
          ml: "220px",
          p: 3,
          width: "calc(100% - 220px)",
          backgroundColor: (theme) => theme.palette.background.default,
          color: (theme) => theme.palette.text.primary,
          minHeight: "100vh",
        }}
      >
        <Typography variant="h4" sx={{ mb: 4 }}>Dashboard</Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
          {statCards.map((card, i) => (
            <Paper
              key={i}
              sx={{
                flex: "1 1 200px",
                p: 3,
                textAlign: "center",
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              {card.icon}
              <Typography variant="h3" sx={{ fontWeight: "bold", mt: 1 }}>
                {card.value}
              </Typography>
              <Typography variant="body2" sx={{ textTransform: "uppercase", fontWeight: "500" }}>
                {card.label}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>Site Traffic Overview</Typography>
        <Box sx={{ width: "100%", height: 450, backgroundColor: (theme) => theme.palette.background.paper, borderRadius: 2, p: 2 }}>
          <ResponsiveContainer>
            <LineChart data={trafficData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="visits" stroke="#8884d8" strokeWidth={2} name="Total Visits" />
              <Line type="monotone" dataKey="flashcardsStudied" stroke="#82ca9d" strokeWidth={2} name="Flashcard learning" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default Admin;
