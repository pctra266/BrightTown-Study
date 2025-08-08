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
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";

interface LinkTabProps {
    label: string;
    to: string;
}

interface NavPage {
    name: string;
    path: string;
}

const LinkTab = React.memo(({ label, to }: LinkTabProps) => (
    <Tab component={Link} label={label} to={to} />
));

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
    fontFamily: "monospace",
    fontWeight: 700,
    letterSpacing: ".0.5rem",
    textDecoration: "none",
} as const;

const useNavbarStyles = (theme: any) =>
    React.useMemo(
        () => ({
            brandColor: theme.palette.mode === "light" ? "inherit" : "#2196f3",
            tabStyles: {
                "& .MuiTab-root": {
                    color: `${theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.7)" : "rgba(33, 150, 243, 0.7)"} `,
                    fontWeight: 400,
                    fontSize: "0.9rem",
                    textTransform: "none",
                    minHeight: "48px",
                    borderRadius: "8px 8px 0 0",
                    margin: "0 4px",
                    transition: "all 0.3s ease-in-out",
                    position: "relative",
                    "&.Mui-selected": {
                        color: `${theme.palette.mode === "light" ? "#fff" : "#2196f3"} `,
                        fontWeight: 800,
                        backgroundColor: `${theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.15)" : "rgba(33, 150, 243, 0.15)"}`,
                        boxShadow: `0 2px 8px ${theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.2)" : "rgba(33, 150, 243, 0.3)"}`,
                        transform: "scale(1.05)",
                        textTransform: "capitalize",
                        transition: "all 0.3s ease-in-out",
                    },
                    "&:hover": {
                        color: `${theme.palette.mode === "light" ? "#fff" : "#2196f3"} `,
                        backgroundColor: `${theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.08)" : "rgba(33, 150, 243, 0.08)"} `,
                        transform: "scale(1.02)",
                        fontWeight: 600,
                    }
                },
                "& .MuiTabs-indicator": {
                    backgroundColor: `${theme.palette.mode === "light" ? "#fff" : "#2196f3"} `,
                    height: "4px",
                    borderRadius: "2px 2px 0 0",
                    boxShadow: `0 -2px 4px ${theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.3)" : "rgba(33, 150, 243, 0.4)"}`,
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
            filteredNavigationTabs.map(({ name, path }) => (
                <LinkTab key={path} label={name} to={path} />
            )),
        [filteredNavigationTabs]
    );

    return (
        <AppBar position="static" color="secondary">
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