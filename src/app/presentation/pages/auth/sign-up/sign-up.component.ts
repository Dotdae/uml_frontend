import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PasswordInputComponent } from 'src/app/presentation/components/password-input/password-input.component';

@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, PasswordInputComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {

}
