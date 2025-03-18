export interface AuthRepository {
  login(email: string, password: string): Promise<boolean>;
  requestPasswordReset(email: string): Promise<boolean>;
}


