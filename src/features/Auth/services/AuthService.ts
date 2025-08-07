import api from "../../../api/api";
import { setCookie, getCookie, eraseCookie } from "../../../utils/CookieUtil";
import { sessionService } from "./SessionService";
import type {
  Account,
  LoginResponse,
  RegisterResponse,
  TokenRefreshResponse,
} from "../Types";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth} from "./firebase"; 
import { CleaningServices } from "@mui/icons-material";

export const authService = {
  async login(
    username: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<LoginResponse> {
    try {
      const accountResponse = await api.get("/account");
      const accounts: Account[] = accountResponse.data;

      const account = accounts.find(
        (acc: Account) => acc.username === username && acc.password === password
      );

      if (!account) {
        return {
          success: false,
          error: "Invalid username or password",
        };
      }

      if (account.status === false) {
        return {
          success: false,
          error: "Your account has been locked. Please contact administrator.",
        };
      }

      const userData = {
        id: account.id,
        username: account.username,
        role: account.role,
      };

      try {
        await sessionService.createSession(account.id);
        console.log("Session created successfully");

        setTimeout(() => {
          console.log(
            "Triggering session conflict check for existing sessions"
          );
        }, 200);
      } catch (sessionError) {
        console.warn(
          "Session creation had issues but continuing with login:",
          sessionError
        );
      }

      const token = this.generateToken(userData, rememberMe);
      const refreshToken = this.generateRefreshToken(userData, rememberMe);

      if (rememberMe) {
        setCookie("accessToken", token, 7);
        setCookie("refreshToken", refreshToken, 30);
        setCookie("rememberMe", "true", 30);
        setCookie("user", JSON.stringify(userData), 7);
      } else {
        setCookie("accessToken", token);
        setCookie("refreshToken", refreshToken);
        setCookie("user", JSON.stringify(userData));
        eraseCookie("rememberMe");
      }

      return {
        success: true,
        user: userData,
        token,
        refreshToken,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "An error occurred during login",
      };
    }
  },async loginByGoogle(): Promise<LoginResponse> {
      try {
        const accountResponse = await api.get("/account");
        const accounts: Account[] = accountResponse.data;
      
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
      
        if (!user.email) {
          return {
            success: false,
            error: "Google account has no email",
          };
        }
      
        let account = accounts.find((acc: Account) => acc.email === user.email);
        let newAccount: Account | null = null;
      
        if (account) {
          if (account.status === false) {
            return {
              success: false,
              error: "Your account has been locked. Please contact administrator.",
            };
          }
        } else {
          // Create new account object
          newAccount = {
            id: user.uid,
            username: user.displayName || user.email || "Unknown",
            email: user.email,
            password: undefined,
            role: "2",
            status: true,
          };
      
          try {
            const res = await fetch("http://localhost:9000/account", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newAccount),
            });
      
            if (!res.ok) {
              console.warn("Failed to save to db.json: ", await res.text());
            } else {
              console.log("Saved to db.json");
            }
          } catch (jsonErr) {
            console.warn("Failed to save to db.json:", jsonErr);
          }
      
          account = newAccount;
        }
      
        const userData = {
          id: account.id,
          username: account.username,
          role: account.role,
        };
      
        await sessionService.createSession(account.id);
        console.log("Session created for Google login");
      
        const token = this.generateToken(userData); 
        const refreshToken = this.generateRefreshToken(userData);
      
        setCookie("accessToken", token, 7);
        setCookie("refreshToken", refreshToken, 30);
        setCookie("rememberMe", "true", 30);
        setCookie("user", JSON.stringify(userData), 7);
      
        return {
          success: true,
          user: userData,
          token,
          refreshToken,
        };
      } catch (error) {
        console.error("Google sign-in failed:", error);
        return {
          success: false,
          error: "Google sign-in failed",
        };
      }
  },
  
  async register(
    username: string,
    password: string
  ): Promise<RegisterResponse> {
    try {
      const accountResponse = await api.get("/account");
      const accounts: Account[] = accountResponse.data;

      const existingAccount = accounts.find(
        (acc: Account) => acc.username === username
      );

      if (existingAccount) {
        return {
          success: false,
          message:
            "Username already exists. Please choose a different username.",
        };
      }

      const maxId = accounts.reduce((max, acc) => {
        const currentId = parseInt(acc.id);
        return currentId > max ? currentId : max;
      }, 0);

      const newId = (maxId + 1).toString();

      const newAccount = {
        id: newId,
        username: username,
        password: password,
        role: "2",
        status: true,
      };

      await api.post("/account", newAccount);

      const userData = {
        id: newId,
        username: username,
        role: "2",
      };

      const token = this.generateToken(userData);
      const refreshToken = this.generateRefreshToken(userData);

      return {
        success: true,
        message: "Account created successfully!",
        token,
        refreshToken,
      };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: "An error occurred during registration",
      };
    }
  },

  async refreshToken(): Promise<TokenRefreshResponse> {
    try {
      const isRemembered = getCookie("rememberMe") === "true";
      const refreshToken = getCookie("refreshToken");

      if (!refreshToken) {
        return {
          success: false,
          error: "No refresh token available",
        };
      }

      const userData = this.verifyToken(refreshToken);
      if (!userData) {
        return {
          success: false,
          error: "Invalid refresh token",
        };
      }

      const newToken = this.generateToken(userData, isRemembered);

      if (isRemembered) {
        setCookie("accessToken", newToken, 7);
      } else {
        setCookie("accessToken", newToken);
      }

      return {
        success: true,
        token: newToken,
      };
    } catch (error) {
      console.error("Token refresh error:", error);
      return {
        success: false,
        error: "Failed to refresh token",
      };
    }
  },

  async checkUsernameExists(username: string): Promise<{ exists: boolean }> {
    try {
      const accountResponse = await api.get("/account");
      const accounts: Account[] = accountResponse.data;

      const existingAccount = accounts.find(
        (acc: Account) => acc.username === username
      );

      return {
        exists: !!existingAccount,
      };
    } catch (error) {
      console.error("Check username error:", error);
      return {
        exists: false,
      };
    }
  },

  async checkCurrentPassword(
    username: string,
    newPassword: string
  ): Promise<{ isSamePassword: boolean }> {
    try {
      const accountResponse = await api.get("/account");
      const accounts: Account[] = accountResponse.data;

      const account = accounts.find(
        (acc: Account) => acc.username === username
      );

      if (!account) {
        return {
          isSamePassword: false,
        };
      }

      return {
        isSamePassword: account.password === newPassword,
      };
    } catch (error) {
      console.error("Check current password error:", error);
      return {
        isSamePassword: false,
      };
    }
  },

  async resetPassword(
    username: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const accountResponse = await api.get("/account");
      const accounts: Account[] = accountResponse.data;

      const account = accounts.find(
        (acc: Account) => acc.username === username
      );

      if (!account) {
        return {
          success: false,
          message: "Account does not exist",
        };
      }

      if (account.password === newPassword) {
        return {
          success: false,
          message: "New password cannot be the same as current password",
        };
      }

      const updatedAccount = {
        ...account,
        password: newPassword,
      };

      await api.put(`/account/${account.id}`, updatedAccount);

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: "An error occurred while changing password",
      };
    }
  },

  generateToken(userData: any, rememberMe: boolean = false): string {
    const header = this.btoaUnicode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const expiration = rememberMe
      ? Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
      : Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  
    const payload =  this.btoaUnicode(
      JSON.stringify({
        ...userData,
        exp: expiration,
        iat: Math.floor(Date.now() / 1000),
      })
    );
    const signature =  this.btoaUnicode("mock-signature");
    return `${header}.${payload}.${signature}`;
  }
  ,

  generateRefreshToken(userData: any, rememberMe: boolean = false): string {
    const header = this.btoaUnicode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const expiration = rememberMe
      ? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      : Math.floor(Date.now() / 1000) + 24 * 60 * 60;

    const payload = this.btoaUnicode(
      JSON.stringify({
        ...userData,
        exp: expiration,
        iat: Math.floor(Date.now() / 1000),
      })
    );
    const signature = this.btoaUnicode("mock-refresh-signature");
    return `${header}.${payload}.${signature}`;
  },
  
  btoaUnicode(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
  },

  verifyToken(token: string): any {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  },

  logout(): void {
    sessionService.destroySession();

    eraseCookie("accessToken");
    eraseCookie("refreshToken");
    eraseCookie("user");
    eraseCookie("rememberMe");
  },

  getToken(): string | null {
    return getCookie("accessToken");
  },

  getUser(): any {
    const userCookie = getCookie("user");
    return userCookie ? JSON.parse(userCookie) : null;
  },

  async validateUserExists(userId: string): Promise<boolean> {
    try {
      const accountResponse = await api.get("/account");
      const accounts: Account[] = accountResponse.data;

      const account = accounts.find((acc: Account) => acc.id === userId);

      return !!account && account.status !== false;
    } catch (error) {
      console.error("Error validating user existence:", error);
      return false;
    }
  },

  async validateSession(userId: string): Promise<boolean> {
    try {
      return await sessionService.isSessionValid(userId);
    } catch (error) {
      console.error("Error validating session:", error);
      return false;
    }
  },

  initializeSessionFromCookie(): void {
    sessionService.initializeFromCookie();
  },

  setForceLogoutCallback(callback: () => void): void {
    sessionService.setForceLogoutCallback(callback);
  },
};
