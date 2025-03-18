import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginUseCase } from '@application/auth/login.usecase';
import { PasswordInputComponent } from 'src/app/presentation/components/password-input/password-input.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, PasswordInputComponent, FormsModule
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
  standalone: true
})
export class SignInComponent {
  email: string = '';
  password: string = '';

  constructor(private loginUseCase: LoginUseCase) { }

  public async signIn() {
    const success = await this.loginUseCase.execute(this.email, this.password);
    if (success) {
      alert(success)
    } else {
      console.error('Login failed');
    }
  }
}
