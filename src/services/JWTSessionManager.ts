import { authService } from "../features/Auth/services/AuthService";

interface SessionMetadata {
  userId: string;
  currentTokenIat: number;
  lastCheck: number;
  sessionId: string; // Thêm unique session ID
}

export class JWTSessionManager {
  private static instance: JWTSessionManager;
  private sessionMetadata: SessionMetadata | null = null;
  private conflictCheckInterval: number | null = null;
  private onConflictCallback: (() => void) | null = null;

  static getInstance(): JWTSessionManager {
    if (!JWTSessionManager.instance) {
      JWTSessionManager.instance = new JWTSessionManager();
    }
    return JWTSessionManager.instance;
  }

  /**
   * Khởi tạo session metadata từ JWT token hiện tại
   */
  async initializeFromToken(userId: string): Promise<boolean> {
    const token = authService.getToken();
    if (!token) return false;

    const decoded = await authService.verifyToken(token);
    if (!decoded || decoded.id !== userId) return false;

    // Tạo unique session ID cho JWT session
    const sessionId = `jwt-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)}`;

    this.sessionMetadata = {
      userId,
      currentTokenIat: decoded.iat || 0,
      lastCheck: Date.now(),
      sessionId,
    };

    console.log(
      `🎯 JWT Session Manager initialized for user ${userId}, token iat: ${decoded.iat}, sessionId: ${sessionId}`
    );
    return true;
  }

  /**
   * Bắt đầu giám sát session conflict dựa trên JWT
   */
  async startMonitoring(userId: string, onConflict: () => void): Promise<void> {
    if (!onConflict || typeof onConflict !== "function") {
      console.error("onConflict callback is required and must be a function");
      return;
    }

    this.onConflictCallback = onConflict;

    const jwtInitialized = await this.initializeFromToken(userId);
    if (!jwtInitialized) {
      console.error("Failed to initialize JWT session manager");
      return;
    }

    // Kiểm tra ít thường xuyên hơn trước đây (3 giây)
    this.conflictCheckInterval = window.setInterval(async () => {
      await this.checkForConflict();
    }, 3000);

    // Kiểm tra ngay lập tức khi focus window
    const handleFocus = async () => {
      console.log("Window focused - checking JWT session");
      await this.checkForConflict();
    };

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log("Tab visible - checking JWT session");
        await this.checkForConflict();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    console.log(`🔍 JWT-based session monitoring started for user ${userId}`);
  }

  /**
   * Kiểm tra session conflict bằng database lastTokenIat
   */
  private async checkForConflict(): Promise<void> {
    if (!this.sessionMetadata) return;

    try {
      const currentToken = authService.getToken();
      if (!currentToken) {
        console.log("🚨 No token found - triggering logout");
        this.triggerConflict();
        return;
      }

      const decoded = await authService.verifyToken(currentToken);
      if (!decoded) {
        console.log("🚨 Invalid token - triggering logout");
        this.triggerConflict();
        return;
      }

      // Kiểm tra với database để phát hiện session conflict
      const hasConflict = await authService.checkSessionConflictByJWT(
        this.sessionMetadata.userId
      );
      if (hasConflict) {
        console.log("🚨 Session conflict detected via database check");
        this.triggerConflict();
        return;
      }

      this.sessionMetadata.lastCheck = Date.now();
    } catch (error) {
      console.error("Error checking JWT session conflict:", error);
      // Trong trường hợp lỗi, không trigger conflict để tránh logout không cần thiết
      // Chỉ log lỗi và tiếp tục
    }
  }

  /**
   * Trigger conflict callback
   */
  private triggerConflict(): void {
    if (
      this.onConflictCallback &&
      typeof this.onConflictCallback === "function"
    ) {
      const callback = this.onConflictCallback; // Save callback trước khi cleanup
      this.stopMonitoring();
      try {
        callback(); // Gọi callback sau khi cleanup
      } catch (error) {
        console.error("Error executing conflict callback:", error);
      }
    } else {
      console.warn("No valid conflict callback available");
      this.stopMonitoring();
    }
  }

  /**
   * Dừng monitoring và cleanup
   */
  stopMonitoring(): void {
    if (this.conflictCheckInterval) {
      clearInterval(this.conflictCheckInterval);
      this.conflictCheckInterval = null;
    }

    window.removeEventListener("focus", this.checkForConflict);
    document.removeEventListener("visibilitychange", this.checkForConflict);

    if (this.sessionMetadata) {
      console.log(
        `🗑️ Session monitoring stopped for user ${this.sessionMetadata.userId}`
      );
    }

    this.sessionMetadata = null;
    this.onConflictCallback = null;

    console.log("🛑 JWT session monitoring stopped");
  }

  /**
   * Update token iat khi có token mới
   */
  updateTokenIat(newIat: number): void {
    if (this.sessionMetadata) {
      this.sessionMetadata.currentTokenIat = newIat;
      this.sessionMetadata.lastCheck = Date.now();

      console.log(`🔄 Token IAT updated to: ${newIat}`);
    }
  }

  /**
   * Get current session info
   */
  getSessionInfo(): SessionMetadata | null {
    return this.sessionMetadata;
  }
}

export const jwtSessionManager = JWTSessionManager.getInstance();
