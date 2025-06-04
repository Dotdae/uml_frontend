import { Inject, Injectable } from "@angular/core";
import { AuthRepository } from "@domain/repositories/auth/auth.repository";
import { AUTH_REPOSITORY_TOKEN } from "@domain/repositories/auth/auth.repository.token";

@Injectable({
  providedIn: 'root'
})
export class LogoutUseCase {

  constructor(@Inject(AUTH_REPOSITORY_TOKEN) private authRepository: AuthRepository) { }

  async execute(): Promise<void> {
    console.log('LogoutUseCase: Starting logout...');

    try {
      // Try server logout with a reasonable timeout
      await Promise.race([
        this.authRepository.logoutFromServer(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Logout timeout')), 8000)
        )
      ]);
    } catch (error) {
      console.error('Logout use case error:', error);
      // If server logout fails, ensure local logout happens
      this.authRepository.logout();
    }
  }
}
