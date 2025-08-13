import { useState } from "react";
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Link as MuiLink,
    Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase"; // your firebase config

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const validateEmail = (value: string) => {
        // Simple regex check
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email, {
                url: "http://localhost:5173/reset",
                handleCodeInApp: true, // IMPORTANT: lets your app handle the link
              });
              
            setSuccess("Password reset email sent! Please check your inbox.");
        } catch (err: any) {
            console.error("Reset email error:", err);
            if (err.code === "auth/user-not-found") {
                setError("No account found with this email.");
            } else {
                setError("Failed to send reset email. Please try again.");
            }
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
                        Forgot Password
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
                            {success}
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
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? "Sending..." : "Send Reset Email"}
                        </Button>
                    </Box>

                    <Box sx={{ textAlign: "center", mt: 2 }}>
                        <Typography variant="body2">
                            Remember your password?{" "}
                            <MuiLink component={Link} to="/login" underline="hover">
                                Sign in
                            </MuiLink>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default ForgotPassword;
