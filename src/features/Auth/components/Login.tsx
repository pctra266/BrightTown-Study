import React, { useState } from "react";
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Link as MuiLink,
    IconButton,
    InputAdornment,
    Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";

const Login = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();


    React.useEffect(() => {
        const accountDeleted = sessionStorage.getItem("accountDeleted");
        const sessionExpired = sessionStorage.getItem("sessionExpired");
        const accountLocked = sessionStorage.getItem("accountLocked");
        const sessionConflict = sessionStorage.getItem("sessionConflict");

        if (accountDeleted) {
            setError("Your account has been deleted. Please contact administrator.");
            sessionStorage.removeItem("accountDeleted");
        } else if (accountLocked) {
            setError("Your account has been locked. Please contact administrator.");
            sessionStorage.removeItem("accountLocked");
        } else if (sessionExpired) {
            setError("Your session has expired. Please login again.");
            sessionStorage.removeItem("sessionExpired");
        } else if (sessionConflict) {
            setError("Your account has been logged in from another browser. Please login again.");
            sessionStorage.removeItem("sessionConflict");
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await login(
                formData.username,
                formData.password
            );

            if (result.success) {
                navigate("/", { replace: true });
            } else {
                setError(result.error || "An error occurred during login");
            }
        } catch {
            setError("An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Typography component="h1" variant="h4" gutterBottom>
                        Login
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ mt: 1, width: "100%" }}
                    >
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 1,
                                mb: 1,
                            }}
                        >
                            <MuiLink
                                component={Link}
                                to="/forgot-password"
                                underline="hover"
                                variant="body2"
                            >
                                Forgot password?
                            </MuiLink>
                            <MuiLink
                                component={Link}
                                to="/register"
                                underline="hover"
                                variant="body2"
                            >
                                Sign up
                            </MuiLink>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
