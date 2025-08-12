import React, { createContext, useContext, useState, useEffect } from "react";
import {
    createTheme,
    ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

type ThemeMode = "system" | "light" | "dark";

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    actualTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useThemeMode must be used within a ThemeProvider");
    }
    return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem("themeMode");
        return (saved as ThemeMode) || "system";
    });

    const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        localStorage.setItem("themeMode", mode);

        if (mode === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            setActualTheme(mediaQuery.matches ? "dark" : "light");

            const handler = (e: MediaQueryListEvent) => {
                setActualTheme(e.matches ? "dark" : "light");
            };

            mediaQuery.addEventListener("change", handler);
            return () => mediaQuery.removeEventListener("change", handler);
        } else {
            setActualTheme(mode);
        }
    }, [mode]);

    const theme = createTheme({
        palette: {
            mode: actualTheme,
            ...(actualTheme === "light"
                ? {
                    // Stack Overflow-inspired light theme
                    primary: {
                        main: "#0074cc", // SO blue
                    },
                    secondary: {
                        main: "#f48225", // SO orange
                    },
                    success: {
                        main: "#5eba7d", // SO green for accepted/positive votes
                    },
                    error: {
                        main: "#d1383d", // SO red for negative votes
                    },
                    warning: {
                        main: "#f48225", // SO orange
                    },
                    text: {
                        primary: "#232629", // SO dark text
                        secondary: "#6a737c", // SO muted text
                    },
                    background: {
                        default: "#ffffff",
                        paper: "#f8f9fa", // SO light background
                    },
                    grey: {
                        50: "#fafafa",
                        100: "#f8f9fa",
                        200: "#e4e6ea",
                        300: "#d6d9dc",
                        400: "#bbc0c4",
                        500: "#9fa6ad",
                        600: "#6a737c",
                        700: "#535a60",
                        800: "#3b4045",
                        900: "#232629",
                    },
                    divider: "#e4e6ea",
                }
                : {
                    // Stack Overflow-inspired dark theme
                    primary: {
                        main: "#0074cc", // Keep SO blue but slightly brighter
                    },
                    secondary: {
                        main: "#f48225", // SO orange
                    },
                    success: {
                        main: "#5eba7d", // SO green
                    },
                    error: {
                        main: "#d1383d", // SO red
                    },
                    warning: {
                        main: "#f48225", // SO orange
                    },
                    text: {
                        primary: "#e4e6ea", // Light text for dark mode
                        secondary: "#9fa6ad", // Muted light text
                    },
                    background: {
                        default: "#0c0d0e", // SO dark background
                        paper: "#161719", // SO dark paper
                    },
                    grey: {
                        50: "#232629",
                        100: "#2d2d30",
                        200: "#393939",
                        300: "#474747",
                        400: "#6a737c",
                        500: "#9fa6ad",
                        600: "#bbc0c4",
                        700: "#d6d9dc",
                        800: "#e4e6ea",
                        900: "#f8f9fa",
                    },
                    divider: "#393939",
                }),
        },
        typography: {
            // Stack Overflow-inspired typography
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            h1: {
                fontSize: "1.75rem",
                fontWeight: 400,
                lineHeight: 1.35,
            },
            h4: {
                fontSize: "1.375rem",
                fontWeight: 400,
                lineHeight: 1.3,
            },
            h5: {
                fontSize: "1.125rem",
                fontWeight: 400,
                lineHeight: 1.3,
            },
            h6: {
                fontSize: "1rem",
                fontWeight: 500,
                lineHeight: 1.3,
            },
            body1: {
                fontSize: "0.875rem",
                lineHeight: 1.5,
            },
            body2: {
                fontSize: "0.75rem",
                lineHeight: 1.4,
            },
        },
        shape: {
            borderRadius: 6, // SO border radius
        },
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: actualTheme === "dark" ? "#1e1e1e" : "#1976d2",
                        color: "#ffffff",
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        boxShadow: actualTheme === "dark"
                            ? "0 1px 3px rgba(0, 0, 0, 0.3)"
                            : "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
                        border: actualTheme === "dark"
                            ? "1px solid #393939"
                            : "1px solid #e4e6ea",
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        fontSize: "0.75rem",
                        height: "auto",
                        "& .MuiChip-label": {
                            padding: "4px 8px",
                        },
                    },
                    outlined: {
                        backgroundColor: actualTheme === "dark" ? "#2d2d30" : "#f8f9fa",
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: "none",
                        fontWeight: 500,
                    },
                },
            },
        },
    });

    return (
        <ThemeContext.Provider value={{ mode, setMode, actualTheme }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
