

import { Inject, Injectable } from "@angular/core";
import { AuthRepository } from "@domain/repositories/auth/auth.repository";
import { AUTH_REPOSITORY_TOKEN } from "@domain/repositories/auth/auth.repository.token";

@Injectable({
  providedIn: 'root'
})
export class LoginGoogleUseCase {

  constructor(@Inject(AUTH_REPOSITORY_TOKEN) private authRepository: AuthRepository) { }

  async execute(): Promise<void> {
    return await this.authRepository.loginGoogle();
  }
}
