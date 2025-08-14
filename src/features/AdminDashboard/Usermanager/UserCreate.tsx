import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addUser } from "./userService";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Alert from "../Alert";
import { useAuth } from "../../../contexts/AuthContext";
import { Box, Paper, Typography, Button, TextField, Select, MenuItem } from "@mui/material";

const UserCreate = () => {
  type Role = { id: string; role: string };
  const navigate = useNavigate();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [alert, setAlert] = useState<{ type: "success" | "info" | "warning"; message: string } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("https://group-03-learning-social-media-json.vercel.app/role");
        const data = await response.json();
        let filteredRoles = [];
        if (user?.role === "0") {
          filteredRoles = data.filter((r: Role) => r.id !== "0");
        } else if (user?.role === "1") {
          filteredRoles = data.filter((r: Role) => r.id === "2");
        }
        setRoles(filteredRoles);
        if (filteredRoles.length > 0) setSelectedRole(filteredRoles[0].id);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, [user?.role]);

  const handleAddUser = async () => {
    const username = usernameRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    if (!username || !password) {
      setAlert({ type: "warning", message: "Username và Password không được để trống." });
      return;
    }
    const newUser = { username, password, role: selectedRole, status: true };
    const result = await addUser(newUser);
    if (result.success) {
      localStorage.setItem("user_create_alert", JSON.stringify({
        type: "success",
        message: "User added successfully!",
      }));
      window.location.href = "/admin/users";
    } else {
      setAlert({ type: "warning", message: result.message || "Failed to add user." });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: (theme) => theme.palette.background.default,
        p: 3,
      }}
    >
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <Box sx={{ maxWidth: 500, mx: "auto" }}>
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
            p: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Add new User
          </Typography>
        </Box>
        <Paper
          sx={{
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label="Username"
            variant="outlined"
            inputRef={usernameRef}
            fullWidth
          />
          <Box sx={{ position: "relative" }}>
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              inputRef={passwordRef}
              fullWidth
            />
            <Button
              onClick={() => setShowPassword(!showPassword)}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                minWidth: "auto",
                color: "text.secondary",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </Box>
          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            fullWidth
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.role}
              </MenuItem>
            ))}
          </Select>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button
              component={Link}
              to="/admin/users"
              variant="outlined"
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddUser}
            >
              Add User
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default UserCreate;
