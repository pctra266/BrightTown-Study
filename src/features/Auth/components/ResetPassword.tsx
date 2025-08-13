import { useState, useEffect } from "react";
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { AlternateEmail, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../services/firebase"; // your Firebase config
import { verifyPasswordResetCode } from "../services/firebase"
import api from "../../../api/api"
interface UpdatePasswordResponse {
    success: boolean;
    message?: string;
    // add other fields returned by your API
}

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [oobCode, setOobCode] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Get oobCode from URL & verify it's valid
    useEffect(() => {
        const code = searchParams.get("oobCode");
        console.log("oobCode", code)
        if (!code) {
            setError("Invalid or missing reset code.");
            return;
        }
        setOobCode(code);
        const verify = searchParams.get("verify");
        if (!verify) {
            setError("In valid");
            return;
        }
        verifyPasswordResetCode(auth, code, verify)
            .then((userEmail) => setEmail(userEmail))
            .catch((err: any) => {
                setError("The reset link is invalid or has expired.")
                console.error("Reset password error:", err); // Full object
                console.log("Error code:", err.code);        // Firebase-specific code
                console.log("Error message:", err.message);  // Human-readable text

                setError(`Error: ${err.code} - ${err.message}`);
            });
    }, [searchParams]);
    useEffect(() => {
        if (success) {
          const timer = setTimeout(() => navigate("/login"), 2000);
          return () => clearTimeout(timer);
        }
      }, [success, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!oobCode) {
            setError("Missing reset code.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            await updatePassword(newPassword);
            setSuccess("Password has been reset successfully!");
            navigate("/login");
        } catch (err: any) {
            console.error("Reset password error:", err);
            setError("Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    async function updatePassword(newPassword: string) {
        const email = searchParams.get("verify");
        if (!email) {
          console.error("No email provided in query params");
          return;
        }
        try {
          const res = await fetch("http://localhost:9000/account");
          if (!res.ok) throw new Error("Failed to fetch accounts");
          const accounts = await res.json();
      
          const account = accounts.find((acc: any) => acc.email === email);
          if (!account) {
            setError("Account not found for email");
            return;
          }
          const patchRes = await fetch(`http://localhost:9000/account/${account.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: newPassword }),
          });
      
          if (!patchRes.ok) throw new Error("Failed to update password");
      
        } catch (error) {
          console.error(error);
        }
      }
      

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
                        Reset Password
                    </Typography>

                    {email && (
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Reset password for: <strong>{email}</strong>
                        </Typography>
                    )}

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
                            name="newPassword"
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                           <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                         <IconButton
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? "Updating..." : "Reset Password"}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default ResetPassword;
