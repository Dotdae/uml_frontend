import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginUseCase } from '@application/auth/login.usecase';
import { PasswordInputComponent } from 'src/app/presentation/components/password-input/password-input.component';
import { FormsModule } from '@angular/forms';
import { HotToastService } from '@ngxpert/hot-toast';
import { LoginGoogleUseCase } from '@application/auth/loginGoogle.usecase';
import { AuthService } from '@infrastructure/auth/auth.service';

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
  private toast = inject(HotToastService);

  constructor(
    private loginUseCase: LoginUseCase,
    private loginGoogleUseCase: LoginGoogleUseCase,
    private router: Router,
  ) { }

  public async signIn() {
    const success = await this.loginUseCase.execute(this.email, this.password);
    if (success) {
      this.toast.success("Inicio sesión", { position: 'top-right' });
      this.router.navigate(['/dashboard']);
    } else {
      console.log(success)
      this.toast.error("Credenciales Incorrectas", { position: 'top-right' });
    }
  }

  public async loginGoogle() {
    const success = await this.loginGoogleUseCase.execute();
    console.log(success);
  }
}
