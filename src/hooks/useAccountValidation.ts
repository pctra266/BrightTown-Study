import { useEffect } from "react";
import { authService } from "../features/Auth/services/AuthService";
import { databaseChangeDetector } from "../services/DatabaseChangeDetector";

interface User {
  id: string;
  username: string;
  role: string;
}

interface AccountCheck {
  id: string;
  username: string;
  status?: boolean;
}

export const useAccountValidation = (user: User | null, logout: () => void) => {
  useEffect(() => {
    let validationInterval: number;

    const validateAccount = async () => {
      if (user && user.id) {
        try {
          const hasChanges = await databaseChangeDetector.checkForChanges();

          if (hasChanges) {
            const exists = await authService.validateUserExists(user.id);
            if (!exists) {
              logout();
              sessionStorage.setItem("accountDeleted", "true");
              window.location.href = "/login";
              return;
            }
          }

        } catch (error) {
          console.error("Error validating account:", error);
        }
      }
    };

    validateAccount();

    if (user) {
      validationInterval = window.setInterval(validateAccount, 5000);
    }

    return () => {
      if (validationInterval) {
        clearInterval(validationInterval);
      }
    };
  }, [user, logout]);

  useEffect(() => {
    const handleFocus = async () => {
      if (user && user.id) {
        try {
          const exists = await authService.validateUserExists(user.id);
          if (!exists) {
            logout();
            sessionStorage.setItem("accountDeleted", "true");
            window.location.href = "/login";
          }
        } catch (error) {
          console.error("Error validating account on focus:", error);
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        handleFocus();
      }
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, [user, logout]);
};
