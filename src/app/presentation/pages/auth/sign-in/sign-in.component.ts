import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginUseCase } from '@application/auth/login.usecase';
import { PasswordInputComponent } from 'src/app/presentation/components/password-input/password-input.component';
import { FormsModule } from '@angular/forms';
import { HotToastService } from '@ngxpert/hot-toast';
import { LoginGoogleUseCase } from '@application/auth/loginGoogle.usecase';
import { AuthService } from '@infrastructure/auth/auth.service'; // Asegúrate de importar el servicio

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
    private authService: AuthService // Inyecta el servicio aquí
  ) { }

  public async signIn() {
    const success = await this.loginUseCase.execute(this.email, this.password);
    if (success) {
      // Decodifica el token y guarda el id al iniciar sesión
      this.authService.getUserId();
      this.toast.success("Inicio sesión", { position: 'top-right' });
      this.router.navigate(['/dashboard/home']);
    } else {
      console.log(success)
      this.toast.error("Credenciales Incorrectas", { position: 'top-right' });
    }
  }

  public async loginGoogle() {
    await this.loginGoogleUseCase.execute();
    // Si el login con Google también guarda el token, decodifica aquí:
    this.authService.getUserId();
    console.log('Google login executed');
  }
}
