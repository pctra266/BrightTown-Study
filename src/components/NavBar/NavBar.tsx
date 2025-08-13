import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Container,
    MenuItem,
    Tabs,
    Tab,
    Stack,
    Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CastForEducationIcon from "@mui/icons-material/CastForEducation";
import { useTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";

interface LinkTabProps {
    label: string;
    to: string;
    isSelected?: boolean;
    theme: Theme;
}

interface NavPage {
    name: string;
    path: string;
}

const LinkTab = React.memo(({ label, to, isSelected, theme }: LinkTabProps) => {
    const selectedStyle = isSelected ? {
        backgroundColor: theme.palette.mode === "light" ? "#ffffff" : "#0074CC",
        color: theme.palette.mode === "light" ? "#0074CC" : "#ffffff",
        fontWeight: 700,
        transform: "translateY(-2px)",
        boxShadow: theme.palette.mode === "light"
            ? "0 4px 12px rgba(0, 116, 204, 0.4), 0 2px 6px rgba(0, 0, 0, 0.15)"
            : "0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(255, 255, 255, 0.2)",
        borderRadius: "8px",
        margin: "0 4px",
        padding: "8px 20px",
        minHeight: "48px"
    } : {};

    return (
        <Tab
            component={Link}
            label={label}
            to={to}
            style={selectedStyle}
        />
    );
});

LinkTab.displayName = "LinkTab";

const PAGES: readonly NavPage[] = [
    { name: "Home", path: "/" },
    { name: "Library", path: "/library" },
    { name: "Exhibition", path: "/book" },
    { name: "Discussion Hub", path: "/talk" },
    { name: "Dashboard", path: "/admin" },
] as const;


const BRAND_NAME = "Bright Town Study";

const COMMON_TYPOGRAPHY_STYLES = {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: 800,
    letterSpacing: ".0.5rem",
    textDecoration: "none",
} as const;

const useNavbarStyles = (theme: Theme) =>
    React.useMemo(
        () => ({
            brandColor: theme.palette.mode === "light" ? "inherit" : "#2196f3",
            tabStyles: {
                "& .MuiTab-root": {
                    color: theme.palette.mode === "light" ? "#ffffff" : "#ffffff",
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "none",
                    minHeight: "48px",
                    borderRadius: "8px",
                    margin: "0 4px",
                    padding: "8px 20px",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        backgroundColor: theme.palette.mode === "light"
                            ? "rgba(255, 255, 255, 0.15)"
                            : "rgba(255, 255, 255, 0.1)",
                        transform: "translateY(-1px)",
                        color: "#ffffff",
                    },
                    "&.Mui-selected": {
                        color: theme.palette.mode === "light" ? "#0074CC" : "#ffffff",
                        fontWeight: 700,
                        backgroundColor: theme.palette.mode === "light"
                            ? "#ffffff"
                            : "#0074CC",
                        transform: "translateY(-2px)",
                        boxShadow: theme.palette.mode === "light"
                            ? "0 4px 12px rgba(0, 116, 204, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1)"
                            : "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(255, 255, 255, 0.1)",
                        "&::after": {
                            content: '""',
                            position: "absolute",
                            bottom: "-2px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "80%",
                            height: "3px",
                            backgroundColor: theme.palette.mode === "light" ? "#0074CC" : "#ffffff",
                            borderRadius: "2px",
                        },
                        "&:hover": {
                            transform: "translateY(-2px)",
                            backgroundColor: theme.palette.mode === "light"
                                ? "#ffffff"
                                : "#1976d2",
                            boxShadow: theme.palette.mode === "light"
                                ? "0 6px 16px rgba(0, 116, 204, 0.4), 0 3px 8px rgba(0, 0, 0, 0.15)"
                                : "0 6px 16px rgba(0, 0, 0, 0.5), 0 3px 8px rgba(255, 255, 255, 0.15)",
                        }
                    }
                },
                "& .MuiTabs-indicator": {
                    display: "none",
                },
                "& .MuiTabs-flexContainer": {
                    gap: "4px",
                },
            },
            signUpButtonStyles: {
                ...(theme.palette.mode === "light" && {
                    backgroundColor: "white",
                    borderColor: "white",
                    "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderColor: "white",
                    },
                }),
            },
        }),
        [theme.palette.mode]
    );

const Navbar = React.memo(() => {
    const location = useLocation();
    // const navigate = useNavigate();
    const theme = useTheme();
    const styles = useNavbarStyles(theme);
    const { user, logout, isAuthenticated } = useAuth();

    const filteredPages = React.useMemo(() => {
        return PAGES.filter(page => {
            if (page.path === "/admin") {
                return (user?.role === "1" || user?.role === "0");
            }
            return true;
        });
    }, [user?.role]);

    const filteredNavigationTabs = React.useMemo(() => {
        return filteredPages.slice(1);
    }, [filteredPages]);

    const getDisplayRole = React.useCallback((role: string) => {
        switch (role) {
            case "0":
                return "SUPER ADMIN";
            case "1":
                return "ADMIN";
            case "2":
                return "USER";
            default:
                return role;
        }
    }, []);

    const [anchorElNav, setAnchorElNav] = React.useState<HTMLElement | null>(
        null
    );

    const handleOpenNavMenu = React.useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            setAnchorElNav(event.currentTarget);
        },
        []
    );

    const handleCloseNavMenu = React.useCallback(() => {
        setAnchorElNav(null);
    }, []);

    const handleTabChange = React.useCallback(() => { }, []);

    const handleLogout = React.useCallback(() => {
        logout();
        window.location.href = "/";
    }, [logout]);

    const tabValue = React.useMemo(() => {
        const tabIndex = filteredNavigationTabs.findIndex((page) => {
            if (page.path === "/") {
                return location.pathname === "/";
            }
            return (
                location.pathname === page.path ||
                location.pathname.startsWith(page.path + "/")
            );
        });
        return tabIndex >= 0 ? tabIndex : false;
    }, [location.pathname, filteredNavigationTabs]);

    const menuItems = React.useMemo(
        () =>
            filteredPages.map(({ name, path }) => (
                <MenuItem key={path} onClick={handleCloseNavMenu} disableGutters>
                    <Link
                        to={path}
                        style={{
                            textDecoration: "none",
                            color: "inherit",
                            width: "100%",
                            display: "block",
                            padding: "6px 16px",
                        }}
                    >
                        {name}
                    </Link>
                </MenuItem>
            )),
        [handleCloseNavMenu, filteredPages]
    );

    const navigationTabs = React.useMemo(
        () =>
            filteredNavigationTabs.map(({ name, path }, index) => {
                const isSelected = tabValue === index;
                return (
                    <LinkTab
                        key={path}
                        label={name}
                        to={path}
                        isSelected={isSelected}
                        theme={theme}
                    />
                );
            }),
        [filteredNavigationTabs, tabValue, theme]
    );

    return (
        <AppBar position="fixed" color="secondary">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* Desktop Logo */}
                    <CastForEducationIcon
                        sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
                    />
                    <Typography
                        variant="h6"
                        noWrap
                        component={Link}
                        to="/"
                        sx={{
                            mr: 2,
                            display: { xs: "none", md: "flex" },
                            color: styles.brandColor,
                            ...COMMON_TYPOGRAPHY_STYLES,
                        }}
                    >
                        {BRAND_NAME}
                    </Typography>

                    {/* Mobile Menu */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: { xs: "flex", md: "none" },
                            justifyContent: "flex-end",
                        }}
                    >
                        <IconButton
                            size="large"
                            aria-label="Open navigation menu"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: "block", md: "none" } }}
                        >
                            {menuItems}
                        </Menu>
                    </Box>

                    {/* Mobile Logo */}
                    <CastForEducationIcon
                        sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
                    />
                    <Typography
                        variant="h5"
                        noWrap
                        component={Link}
                        to="/"
                        sx={{
                            mr: 2,
                            display: { xs: "flex", md: "none" },
                            flexGrow: 1,
                            color: styles.brandColor,
                            ...COMMON_TYPOGRAPHY_STYLES,
                        }}
                    >
                        {BRAND_NAME}
                    </Typography>

                    {/* Desktop Navigation Tabs */}
                    <Box
                        sx={{
                            flex: 1,
                            display: { xs: "none", md: "flex" },
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            aria-label="Navigation tabs"
                            role="navigation"
                            sx={styles.tabStyles}
                        >
                            {navigationTabs}
                        </Tabs>
                    </Box>

                    {/* Auth Buttons */}
                    <Stack direction="row" spacing={2} sx={{ mr: 1 }}>
                        {isAuthenticated ? (
                            <>
                                <Button
                                    component={Link}
                                    to="/profile"
                                    variant="outlined"
                                    sx={styles.signUpButtonStyles}
                                >
                                    {user?.username}-{getDisplayRole(user?.role || "")}
                                </Button>
                                <Button variant="contained" onClick={handleLogout}>
                                    Log Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    component={Link}
                                    to="/register"
                                    variant="outlined"
                                    sx={styles.signUpButtonStyles}
                                >
                                    Sign up
                                </Button>
                                <Button component={Link} to="/login" variant="contained">
                                    Log in
                                </Button>
                            </>
                        )}
                    </Stack>

                    <ThemeToggle />
                </Toolbar>
            </Container>
        </AppBar>
    );
});

Navbar.displayName = "Navbar";

export default Navbar;