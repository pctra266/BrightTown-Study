import api from "../../../api/api";
import { getCookie, setCookie, eraseCookie } from "../../../utils/CookieUtil";

interface SessionInfo {
  id?: string;
  sessionId: string;
  userId: string;
  createdAt: string;
  lastActive: string;
  browserInfo: string;
}

export class SessionService {
  private static instance: SessionService;
  private currentSessionId: string | null = null;
  private sessionCheckInterval: number | null = null;
  private onForceLogout: (() => void) | null = null;
  private focusHandler: (() => void) | null = null;
  private visibilityHandler: (() => void) | null = null;

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    const timestamp = new Date().toISOString();
    return `${userAgent.substring(0, 100)}-${timestamp}`;
  }

  async createSession(userId: string): Promise<string> {
    const sessionId = this.generateSessionId();
    const browserInfo = this.getBrowserInfo();

    try {
      let sessions: SessionInfo[] = [];
      try {
        const response = await api.get("/sessions");
        sessions = response.data || [];
      } catch (error) {
        console.warn(
          "Could not fetch existing sessions, continuing with empty array:",
          error
        );
      }

      const userSessions = sessions.filter((s) => s.userId === userId);
      if (userSessions.length > 0) {
        console.log(
          `🔄 Found ${userSessions.length} existing session(s) for user ${userId}. Invalidating them...`
        );

        const deletePromises = userSessions.map(async (session) => {
          try {
            await api.delete(`/sessions/${session.id}`);
            console.log(`✅ Invalidated session: ${session.sessionId}`);
          } catch (error) {
            console.warn(
              `Could not delete session ${session.sessionId}:`,
              error
            );
          }
        });

        await Promise.all(deletePromises);
        console.log(
          `🧹 All existing sessions for user ${userId} have been processed`
        );
      }

      const newSession: SessionInfo = {
        sessionId,
        userId,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        browserInfo,
      };

      await api.post("/sessions", newSession);

      this.currentSessionId = sessionId;
      setCookie("sessionId", sessionId);

      console.log(`🎯 New session created: ${sessionId} for user ${userId}`);

      this.startSessionMonitoring(userId);

      return sessionId;
    } catch (error) {
      console.error("Error creating session:", error);

      this.currentSessionId = sessionId;
      setCookie("sessionId", sessionId);
      return sessionId;
    }
  }

  async updateActivity(): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      const response = await api.get(`/sessions`);
      const sessions: SessionInfo[] = response.data || [];
      const currentSession = sessions.find(
        (s) => s.sessionId === this.currentSessionId
      );

      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          lastActive: new Date().toISOString(),
        };
        await api.put(`/sessions/${this.currentSessionId}`, updatedSession);
      }
    } catch (error) {
      console.error("Error updating session activity:", error);
    }
  }

  async isSessionValid(userId: string): Promise<boolean> {
    if (!this.currentSessionId) return false;

    try {
      const response = await api.get(`/sessions`);
      const sessions: SessionInfo[] = response.data || [];
      const currentSession = sessions.find(
        (s) => s.sessionId === this.currentSessionId
      );

      if (!currentSession) {
        console.log(
          `❌ Current session ${this.currentSessionId} not found in database`
        );
        return false;
      }
      if (currentSession.userId !== userId) {
        console.log(
          `❌ Session ${this.currentSessionId} belongs to different user`
        );
        return false;
      }

      const userSessions = sessions.filter((s) => s.userId === userId);
      if (userSessions.length === 0) {
        console.log(`❌ No sessions found for user ${userId}`);
        return false;
      }

      const newestSession = userSessions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      const isCurrentNewest =
        newestSession?.sessionId === this.currentSessionId;
      if (!isCurrentNewest) {
        console.log(
          `🔄 Session ${this.currentSessionId} is not the newest. Newest: ${newestSession?.sessionId}`
        );
      }

      return isCurrentNewest;
    } catch (error) {
      console.error("Error checking session validity:", error);

      return false;
    }
  }

  async forceCheckSession(userId: string): Promise<void> {
    const isValid = await this.isSessionValid(userId);
    if (!isValid && this.onForceLogout) {
      console.log(
        `🔒 Immediate session conflict detected for user ${userId}. Current session will be terminated.`
      );
      this.stopSessionMonitoring();
      this.onForceLogout();
    }
  }

  private startSessionMonitoring(userId: string): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = window.setInterval(async () => {
      const isValid = await this.isSessionValid(userId);
      if (!isValid && this.onForceLogout) {
        console.log(
          `🔒 Session conflict detected for user ${userId}. Current session will be terminated.`
        );
        this.stopSessionMonitoring();
        this.onForceLogout();
      }
    }, 500);

    const handleFocus = async () => {
      console.log("Window focused - checking session immediately");
      await this.forceCheckSession(userId);
    };

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log("Tab became visible - checking session immediately");
        await this.forceCheckSession(userId);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    this.focusHandler = handleFocus;
    this.visibilityHandler = handleVisibilityChange;
  }

  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }

    if (this.focusHandler) {
      window.removeEventListener("focus", this.focusHandler);
      this.focusHandler = null;
    }
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  setForceLogoutCallback(callback: () => void): void {
    this.onForceLogout = callback;
  }

  async destroySession(): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      const response = await api.get("/sessions");
      const sessions: SessionInfo[] = response.data || [];
      const currentSession = sessions.find(
        (s) => s.sessionId === this.currentSessionId
      );

      if (currentSession && currentSession.id) {
        await api.delete(`/sessions/${currentSession.id}`);
        console.log(`🗑️ Destroyed session: ${this.currentSessionId}`);
      }
    } catch (error) {
      console.warn(
        "Error destroying session (session may already be deleted):",
        error
      );
    } finally {
      this.currentSessionId = null;
      eraseCookie("sessionId");
      this.stopSessionMonitoring();
    }
  }

  initializeFromCookie(): void {
    const sessionId = getCookie("sessionId");
    if (sessionId) {
      this.currentSessionId = sessionId;
    }
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  async cleanupExpiredSessions(): Promise<void> {
    try {
      const response = await api.get("/sessions");
      const sessions: SessionInfo[] = response.data || [];
      const now = new Date().getTime();

      const expiredSessions = sessions.filter((session) => {
        const lastActive = new Date(session.lastActive).getTime();
        return now - lastActive > 24 * 60 * 60 * 1000;
      });

      for (const session of expiredSessions) {
        await api.delete(`/sessions/${session.sessionId}`);
      }
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
    }
  }
}

export const sessionService = SessionService.getInstance();
