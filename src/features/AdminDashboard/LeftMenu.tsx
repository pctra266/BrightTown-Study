import React from "react";
import { NavLink, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Box, useTheme } from "@mui/material";

const LeftMenu = () => {
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "2") {
    return <Navigate to="/" replace />;
  }

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: "block",
    padding: "15px 25px",
    fontWeight: 500,
    textDecoration: "none",
    transition: "background 0.2s, color 0.2s",
    color: isActive ? theme.palette.common.white : theme.palette.primary.main,
    backgroundColor: isActive ? theme.palette.primary.main : "transparent",
    "&:hover": {
      backgroundColor: isActive
        ? theme.palette.primary.dark
        : theme.palette.action.hover,
    },
  });

  return (
    <Box
      sx={{
        position: "fixed",
        top: "63px",
        left: 0,
        width: "220px",
        height: "calc(100vh - 63px)",
        backgroundColor: theme.palette.background.paper,
        boxShadow: "2px 0 5px rgba(0, 0, 0, 0.05)",
        borderRight: `1px solid ${theme.palette.divider}`,
        zIndex: 1000,
        overflowY: "auto",
      }}
    >
      <NavLink to="/admin" end style={linkStyle}>
        Dashboard
      </NavLink>
      <NavLink to="/admin/users" style={linkStyle}>
        Manage User
      </NavLink>
      <NavLink to="/admin/flashcards" style={linkStyle}>
        Manage Flashcard
      </NavLink>
      <NavLink to="/admin/recycle" style={linkStyle}>
        Recycle Bin
      </NavLink>
    </Box>
  );
};

export default LeftMenu;
