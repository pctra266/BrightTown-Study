import { authService } from "../features/Auth/services/AuthService";

interface AccountSummary {
  id: string;
  username: string;
  status?: boolean;
}

class DatabaseChangeDetector {
  private lastAccountsHash: string | null = null;
  private isChecking = false;

  async checkForChanges(): Promise<boolean> {
    if (this.isChecking) return false;

    this.isChecking = true;
    try {
      const response = await fetch("http://localhost:9000/account");
      const accounts: AccountSummary[] = await response.json();

      const currentHash = JSON.stringify(
        accounts
          .map((acc: AccountSummary) => ({
            id: acc.id,
            username: acc.username,
            status: acc.status,
          }))
          .sort((a: AccountSummary, b: AccountSummary) =>
            a.id.localeCompare(b.id)
          )
      );

      if (this.lastAccountsHash === null) {
        this.lastAccountsHash = currentHash;
        return false;
      }

      const hasChanges = this.lastAccountsHash !== currentHash;
      this.lastAccountsHash = currentHash;

      return hasChanges;
    } catch (error) {
      console.error("Error checking for database changes:", error);
      return false;
    } finally {
      this.isChecking = false;
    }
  }

  async validateCurrentUser(): Promise<boolean> {
    const currentUser = authService.getUser();
    if (!currentUser || !currentUser.id) {
      return true;
    }

    return await authService.validateUserExists(currentUser.id);
  }

  reset() {
    this.lastAccountsHash = null;
  }
}

export const databaseChangeDetector = new DatabaseChangeDetector();
