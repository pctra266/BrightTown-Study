import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchUserWithFlashcardSets, updateUser } from "./userService";
import Alert from "../Alert";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Paper,
} from "@mui/material";

export default function UserEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState(true);
  const [roles, setRoles] = useState<{ id: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    type: "success" | "info" | "warning";
    message: string;
  } | null>(null);
  const [targetUser, setTargetUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !currentUser) {
        navigate("/admin/users");
        return;
      }

      try {
        // Fetch roles
        const rolesRes = await fetch("http://localhost:9000/role");
        const allRoles = await rolesRes.json();
        let filteredRoles = [];
        if (currentUser.role === "0") {
          filteredRoles = allRoles.filter((r: any) => r.id !== "0");
        } else if (currentUser.role === "1") {
          filteredRoles = allRoles.filter((r: any) => r.id === "2");
        }
        setRoles(filteredRoles);

        // Fetch target user
        const { user } = await fetchUserWithFlashcardSets(id);
        if (!user) {
          navigate("/not-found");
          return;
        }

        const isSuperAdmin = currentUser.role === "0";
        const isAdmin = currentUser.role === "1";
        const isEditingSelf = currentUser.id === user.id;

        if (isAdmin && isEditingSelf) {
          navigate("/admin/users");
          return;
        }
        if (isSuperAdmin || (isAdmin && user.role === "2")) {
          setTargetUser(user);
        } else {
          navigate("/admin/users");
          return;
        }

        setUsername(user.username || "");
        setPassword(user.password || "");
        setRole(user.role || (filteredRoles.length ? filteredRoles[0].id : ""));
        setStatus(user.status);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [id, currentUser, navigate]);

  const isGoogleAccount = !!targetUser?.email && !targetUser?.password;

  const handleUpdate = async () => {
    if (!username.trim()) {
      setAlert({ type: "warning", message: "Username không được để trống." });
      return;
    }

    if (!isGoogleAccount && !password.trim()) {
      setAlert({ type: "warning", message: "Password không được để trống." });
      return;
    }

    const updatedData: any = {
      id: id!,
      username: username.trim(),
      role,
      status,
    };

    if (!isGoogleAccount) {
      updatedData.password = password.trim();
    }
    if (targetUser?.email) {
      updatedData.email = targetUser.email;
    }

    const result = await updateUser(updatedData);

    if (result.success) {
      localStorage.setItem(
        "user_update_alert",
        JSON.stringify({
          type: "success",
          message: "User updated successfully!",
        })
      );
      window.location.href = "/admin/users";
    } else {
      setAlert({
        type: "warning",
        message: result.message || "Cập nhật thất bại.",
      });
    }
  };

  if (loading) return <Box p={3}>Loading...</Box>;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: (theme) => theme.palette.background.default,
        p: 3,
      }}
    >
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
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
            Update User
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />
          {!isGoogleAccount && (
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
          )}
          <FormControl fullWidth>
            <FormLabel>Role</FormLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={currentUser?.role === "1" || targetUser?.role === "0"}
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Status</FormLabel>
            <RadioGroup
              row
              value={status ? "true" : "false"}
              onChange={(e) => setStatus(e.target.value === "true")}
            >
              <FormControlLabel value="true" control={<Radio />} label="Active" />
              <FormControlLabel value="false" control={<Radio />} label="Inactive" />
            </RadioGroup>
          </FormControl>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button component={Link} to="/admin/users" variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleUpdate}>
              Update User
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
