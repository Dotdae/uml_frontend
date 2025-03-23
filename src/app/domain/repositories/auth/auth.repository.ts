import { Observable } from "rxjs";

export interface AuthRepository {
  login(email: string, password: string): Promise<boolean>;
  requestPasswordReset(email: string): Promise<boolean>;
  loginGoogle(): Promise<void>;
  getAccessToken(): string | null;
  refreshAccessToken(): Observable<boolean>;
  logout(): void;
  rehydrateAccessToken(): Promise<void>;
}


