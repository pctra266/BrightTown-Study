import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
} from "react";
import { authService } from "../features/Auth/services/AuthService";
import { useAccountValidation } from "../hooks/useAccountValidation";
import { jwtSessionManager } from "../services/JWTSessionManager";

interface User {
    id: string;
    username: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (
        username: string,
        password: string
    ) => Promise<{ success: boolean; error?: string }>;
    register: (
        username: string,
        password: string
    ) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const tokenCheckIntervalRef = useRef<number | null>(null);

    useAccountValidation(user, () => {
        authService.logout();
        setUser(null);
    });

    useEffect(() => {
        const initializeAuth = async () => {
            const token = authService.getToken();
            const storedUser = authService.getUser();

            if (token && storedUser) {
                const userData = await authService.verifyToken(token);
                if (userData) {
                    setUser(storedUser);

                    // Chỉ dùng JWT session manager
                    const jwtInitialized = await jwtSessionManager.initializeFromToken(storedUser.id);
                    if (jwtInitialized) {
                        await jwtSessionManager.startMonitoring(storedUser.id, () => {
                            console.log("JWT session conflict detected - logging out");
                            authService.logout();
                            setUser(null);
                            sessionStorage.setItem("sessionConflict", "true");
                            const protectedRoutes = ["/user", "/admin", "/talk"];
                            const currentPath = window.location.pathname;
                            if (protectedRoutes.some((route) => currentPath.startsWith(route))) {
                                window.location.href = "/login";
                            }
                        });

                        setTimeout(async () => {
                            const isValidSession = await authService.validateSession(storedUser.id);
                            if (!isValidSession) {
                                console.log("Session invalid on initialization - logging out");
                                authService.logout();
                                setUser(null);
                                sessionStorage.setItem("sessionConflict", "true");
                                const protectedRoutes = ["/user", "/admin", "/talk"];
                                const currentPath = window.location.pathname;
                                if (protectedRoutes.some((route) => currentPath.startsWith(route))) {
                                    window.location.href = "/login";
                                }
                            }
                        }, 100);
                    } else {
                        authService.logout();
                        setUser(null);
                    }
                } else {
                    authService.logout();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initializeAuth();

        tokenCheckIntervalRef.current = window.setInterval(async () => {
            const token = authService.getToken();
            const currentUser = authService.getUser();

            if (token && currentUser) {
                const userData = await authService.verifyToken(token);
                if (!userData) {
                    authService.logout();
                    setUser(null);
                    sessionStorage.setItem("sessionExpired", "true");

                    const protectedRoutes = ["/user", "/admin"];
                    const currentPath = window.location.pathname;

                    if (protectedRoutes.some((route) => currentPath.startsWith(route))) {
                        window.location.href = "/login";
                    }
                    return;
                }

                const userExists = await authService.validateUserExists(currentUser.id);
                if (!userExists) {
                    try {
                        const accountResponse = await fetch('http://localhost:9000/account');
                        const accounts = await accountResponse.json();
                        const account = accounts.find((acc: { id: string; status: boolean }) => acc.id === currentUser.id);

                        if (!account) {
                            sessionStorage.setItem("accountDeleted", "true");
                        } else if (account.status === false) {
                            sessionStorage.setItem("accountLocked", "true");
                        } else {
                            sessionStorage.setItem("accountDeleted", "true");
                        }
                    } catch {
                        sessionStorage.setItem("accountDeleted", "true");
                    }

                    authService.logout();
                    setUser(null);

                    window.location.href = "/login";
                }
            }
        }, 30000);

        return () => {
            if (tokenCheckIntervalRef.current) {
                clearInterval(tokenCheckIntervalRef.current);
            }
        };
    }, []);

    const login = async (
        username: string,
        password: string
    ): Promise<{ success: boolean; error?: string }> => {
        const result = await authService.login(username, password);

        if (result.success && result.user) {
            const userData: User = {
                id: result.user.id,
                username: result.user.username,
                role: result.user.role,
            };

            setUser(userData);

            // Khởi tạo JWT session manager cho session mới
            setTimeout(async () => {
                const jwtInitialized = await jwtSessionManager.initializeFromToken(userData.id);
                if (jwtInitialized) {
                    await jwtSessionManager.startMonitoring(userData.id, () => {
                        console.log("JWT session conflict detected during session - logging out");
                        authService.logout();
                        setUser(null);
                        sessionStorage.setItem("sessionConflict", "true");
                        const protectedRoutes = ["/user", "/admin", "/talk"];
                        const currentPath = window.location.pathname;
                        if (protectedRoutes.some((route) => currentPath.startsWith(route))) {
                            window.location.href = "/login";
                        }
                    });
                } else {
                    console.warn("Failed to initialize JWT session manager after login");
                }
            }, 100);

            return { success: true };
        }

        return { success: false, error: result.error };
    };

    const register = async (
        username: string,
        password: string
    ): Promise<{ success: boolean; message: string }> => {
        const result = await authService.register(username, password);
        return {
            success: result.success,
            message: result.message,
        };
    };

    const logout = () => {
        // Dừng JWT session monitoring
        jwtSessionManager.stopMonitoring();

        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};