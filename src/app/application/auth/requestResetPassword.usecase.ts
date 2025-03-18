import { Inject, Injectable } from "@angular/core";
import { AuthRepository } from "@domain/repositories/auth/auth.repository";
import { AUTH_REPOSITORY_TOKEN } from "@domain/repositories/auth/auth.repository.token";

@Injectable({
  providedIn: 'root'
})
export class RequestResetPasswordUseCase {

  constructor(@Inject(AUTH_REPOSITORY_TOKEN) private authRepository: AuthRepository) { }

  async execute(email: string): Promise<boolean> {
    return await this.authRepository.requestPasswordReset(email);
  }
}
