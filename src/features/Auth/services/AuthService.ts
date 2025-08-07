import api from "../../../api/api";
import { setCookie, getCookie, eraseCookie } from "../../../utils/CookieUtil";
import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from "jose";
import type {
  Account,
  LoginResponse,
  RegisterResponse,
  TokenRefreshResponse,
} from "../Types";

// JWT Secret key - Trong production nên lưu trong environment variables
const JWT_SECRET = new TextEncoder().encode("your-super-secret-jwt-key-2025");

interface JWTPayload extends JoseJWTPayload {
  id: string;
  username: string;
  role: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
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

      const token = await this.generateToken(userData);
      const refreshToken = await this.generateRefreshToken(userData);

      // Decode token để lấy iat và update vào database
      const decoded = await this.verifyToken(token);
      if (decoded?.iat) {
        await this.updateLastTokenIat(account.id, decoded.iat);
      }

      // Set cookies với thời gian mặc định (24h)
      setCookie("accessToken", token);
      setCookie("refreshToken", refreshToken);
      setCookie("user", JSON.stringify(userData));

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

      const token = await this.generateToken(userData);
      const refreshToken = await this.generateRefreshToken(userData);

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
      const refreshToken = getCookie("refreshToken");

      if (!refreshToken) {
        return {
          success: false,
          error: "No refresh token available",
        };
      }

      const userData = await this.verifyToken(refreshToken);
      if (!userData) {
        return {
          success: false,
          error: "Invalid refresh token",
        };
      }

      const newToken = await this.generateToken({
        id: userData.id,
        username: userData.username,
        role: userData.role,
      });

      setCookie("accessToken", newToken);

      return {
        success: true,
        token: newToken,
      };
    } catch (error) {
      console.error("Token refresh error:", error);
      return {
        success: false,
        error: "Token refresh failed",
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

      return { exists: !!existingAccount };
    } catch (error) {
      console.error("Error checking username:", error);
      return { exists: false };
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
        return { isSamePassword: false };
      }

      return { isSamePassword: account.password === newPassword };
    } catch (error) {
      console.error("Error checking current password:", error);
      return { isSamePassword: false };
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
          message: "User not found",
        };
      }

      account.password = newPassword;

      await api.put(`/account/${account.id}`, account);

      return {
        success: true,
        message: "Password updated successfully",
      };
    } catch (error) {
      console.error("Error resetting password:", error);
      return {
        success: false,
        message: "Failed to update password",
      };
    }
  },

  async generateToken(userData: {
    id: string;
    username: string;
    role: string;
  }): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const expiration = now + 24 * 60 * 60; // 24 hours

    const token = await new SignJWT({
      id: userData.id,
      username: userData.username,
      role: userData.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(now)
      .setExpirationTime(expiration)
      .sign(JWT_SECRET);

    return token;
  },

  async generateRefreshToken(userData: {
    id: string;
    username: string;
    role: string;
  }): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const expiration = now + 7 * 24 * 60 * 60; // 7 days

    const token = await new SignJWT({
      id: userData.id,
      username: userData.username,
      role: userData.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(now)
      .setExpirationTime(expiration)
      .sign(JWT_SECRET);

    return token;
  },

  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload as JWTPayload;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  },

  logout(): void {
    eraseCookie("accessToken");
    eraseCookie("refreshToken");
    eraseCookie("user");

    console.log("🔓 Logout completed, auth cookies cleared");
  },

  getToken(): string | null {
    return getCookie("accessToken");
  },

  getUser(): { id: string; username: string; role: string } | null {
    const userCookie = getCookie("user");
    return userCookie ? JSON.parse(userCookie) : null;
  },

  // Kiểm tra session conflict bằng JWT và database lastTokenIat
  async checkSessionConflictByJWT(userId: string): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return true; // Không có token = conflict

      const decoded = await this.verifyToken(token);
      if (!decoded) return true; // Token không hợp lệ = conflict

      // Lấy thông tin user mới nhất từ database
      const accountResponse = await api.get("/account");
      const accounts: Account[] = accountResponse.data;
      const account = accounts.find((acc: Account) => acc.id === userId);

      if (!account || account.status === false) {
        return true; // User không tồn tại hoặc bị khóa = conflict
      }

      // Kiểm tra lastTokenIat trong database để phát hiện session mới hơn
      const currentTokenIat = decoded.iat || 0;
      const storedLastTokenIat = account.lastTokenIat || 0;

      if (storedLastTokenIat > currentTokenIat) {
        console.log(
          `🔍 Session conflict detected via database. Current iat: ${currentTokenIat}, Database lastTokenIat: ${storedLastTokenIat}`
        );
        return true; // Có conflict - có session mới hơn
      }

      return false; // Không có conflict
    } catch (error) {
      console.error("Error checking session conflict:", error);
      return true; // Lỗi = coi như có conflict để an toàn
    }
  },

  // Cập nhật lastTokenIat trong database khi user login
  async updateLastTokenIat(userId: string, tokenIat: number): Promise<boolean> {
    try {
      // Get current account data
      const accountResponse = await api.get("/account");
      const accounts: Account[] = accountResponse.data;
      const accountIndex = accounts.findIndex(
        (acc: Account) => acc.id === userId
      );

      if (accountIndex === -1) {
        console.error(`User with id ${userId} not found`);
        return false;
      }

      // Update lastTokenIat
      accounts[accountIndex].lastTokenIat = tokenIat;

      // Save back to database
      await api.patch(`/account/${userId}`, { lastTokenIat: tokenIat });

      console.log(`✅ Updated lastTokenIat for user ${userId}: ${tokenIat}`);
      return true;
    } catch (error) {
      console.error("Error updating lastTokenIat:", error);
      return false;
    }
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
      // Chỉ kiểm tra JWT-based session conflict
      const hasJWTConflict = await this.checkSessionConflictByJWT(userId);
      return !hasJWTConflict;
    } catch (error) {
      console.error("Error validating session:", error);
      return false;
    }
  },
};
