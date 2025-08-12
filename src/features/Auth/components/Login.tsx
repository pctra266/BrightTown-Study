import React, { useState, useRef } from "react";
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
    FormHelperText,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import { TurnstileWrapper, type TurnstileRef } from "../../../components/TurnstileWrapper";

const Login = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    // Validation states
    const [fieldErrors, setFieldErrors] = useState({
        username: "",
        password: "",
    });
    const [touched, setTouched] = useState({
        username: false,
        password: false,
    });

    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const turnstileRef = useRef<TurnstileRef>(null);

    const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

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

    // Validation functions
    const validateUsername = (username: string): string => {
        if (!username.trim()) {
            return "Username is required";
        }
        if (username.length < 3) {
            return "Username must be at least 3 characters long";
        }
        if (username.length > 30) {
            return "Username must be less than 30 characters";
        }
        const usernameRegex = /^[a-zA-Z0-9]+$/;
        if (!usernameRegex.test(username)) {
            return "Username can only contain letters and numbers";
        }
        return "";
    };

    const validatePassword = (password: string): string => {
        if (!password) {
            return "Password is required";
        }
        if (password.length < 6) {
            return "Password must be at least 6 characters long";
        }
        return "";
    };

    const validateField = (fieldName: string, value: string): string => {
        switch (fieldName) {
            case "username":
                return validateUsername(value);
            case "password":
                return validatePassword(value);
            default:
                return "";
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        // Real-time validation
        if (touched[name as keyof typeof touched]) {
            const errorMessage = validateField(name, value);
            setFieldErrors(prev => ({
                ...prev,
                [name]: errorMessage
            }));
        }

        // Clear general error when user starts typing
        if (error) {
            setError("");
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Mark field as touched
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        // Validate on blur
        const errorMessage = validateField(name, value);
        setFieldErrors(prev => ({
            ...prev,
            [name]: errorMessage
        }));
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleTurnstileSuccess = (token: string) => {
        setTurnstileToken(token);
    };

    const handleTurnstileError = () => {
        setTurnstileToken(null);
        setError("Captcha verification failed. Please try again.");
    };

    const handleTurnstileExpire = () => {
        setTurnstileToken(null);
        setError("Captcha expired. Please verify again.");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate all fields
        const usernameError = validateUsername(formData.username);
        const passwordError = validatePassword(formData.password);

        const newFieldErrors = {
            username: usernameError,
            password: passwordError,
        };

        setFieldErrors(newFieldErrors);
        setTouched({
            username: true,
            password: true,
        });

        // Stop submission if there are validation errors
        if (usernameError || passwordError) {
            return;
        }

        // Check if Turnstile is enabled and token is required
        if (turnstileSiteKey && !turnstileToken) {
            setError("Please complete the captcha verification.");
            return;
        }

        setLoading(true);

        try {
            // Pass the turnstile token to the login function
            const result = await login(
                formData.username,
                formData.password,
                turnstileToken || undefined
            );

            if (result.success) {
                navigate("/", { replace: true });
            } else {
                setError(result.error || "An error occurred during login");
                // Reset Turnstile on login failure
                if (turnstileSiteKey && turnstileRef.current) {
                    turnstileRef.current.reset();
                    setTurnstileToken(null);
                }
            }
        } catch {
            setError("An error occurred during login");
            // Reset Turnstile on error
            if (turnstileSiteKey && turnstileRef.current) {
                turnstileRef.current.reset();
                setTurnstileToken(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {

        const result = await loginWithGoogle();
        if (result.success) {
            navigate("/");
        } else {
            setError(result.error || "An error occurred during login");
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
                            onBlur={handleBlur}
                            error={touched.username && !!fieldErrors.username}
                            helperText={touched.username && fieldErrors.username ? fieldErrors.username : ""}
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
                            onBlur={handleBlur}
                            error={touched.password && !!fieldErrors.password}
                            helperText={touched.password && fieldErrors.password ? fieldErrors.password : ""}
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

                        {/* Add helpful text for users */}
                        {!touched.username && !touched.password && (
                            <Box sx={{ mt: 1, mb: 1 }}>
                                <FormHelperText sx={{ color: 'text.secondary', fontSize: '0.75rem', margin: 0 }}>
                                    Enter your username and password to sign in to your account
                                </FormHelperText>
                            </Box>
                        )}

                        {/* Cloudflare Turnstile Captcha */}
                        {turnstileSiteKey && (
                            <Box sx={{ mt: 2, mb: 2, display: "flex", justifyContent: "center" }}>
                                <TurnstileWrapper
                                    ref={turnstileRef}
                                    siteKey={turnstileSiteKey}
                                    onSuccess={handleTurnstileSuccess}
                                    onError={handleTurnstileError}
                                    onExpire={handleTurnstileExpire}
                                    theme="auto"
                                    size="normal"
                                    language="en"
                                    disabled={loading}
                                />
                            </Box>
                        )}

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
                            disabled={
                                loading ||
                                (turnstileSiteKey && !turnstileToken) ||
                                (touched.username && !!fieldErrors.username) ||
                                (touched.password && !!fieldErrors.password) ||
                                !formData.username.trim() ||
                                !formData.password.trim()
                            }
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleGoogleLogin}
                            sx={{ mt: 1, mb: 2 }}

                        >
                            Sign in with Google
                        </Button>

                        <Box sx={{ textAlign: "center", mt: 2 }}>
                            <Typography variant="body2">
                                Don't have an account?{" "}
                                <MuiLink component={Link} to="/register" underline="hover">
                                    Sign up here
                                </MuiLink>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
