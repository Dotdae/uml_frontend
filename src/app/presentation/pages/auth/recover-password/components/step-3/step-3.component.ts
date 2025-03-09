import { CommonModule } from '@angular/common';
import { Component, Input, Output } from '@angular/core';
import { PrimaryButtonComponent } from 'src/app/presentation/components/buttons/primary-button/primary-button.component';
import { SecondaryButtonComponent } from 'src/app/presentation/components/buttons/secondary-button/secondary-button.component';
import { PasswordInputComponent } from 'src/app/presentation/components/password-input/password-input.component';

@Component({
  selector: 'app-step-3',
  imports: [CommonModule, PrimaryButtonComponent, SecondaryButtonComponent, PasswordInputComponent],
  templateUrl: './step-3.component.html',
  styleUrl: './step-3.component.css'
})
export class Step3Component {
  TextPrimary = "Cambiar la contraseña";
  TextSecondary = "Cancelar";
  @Input() nextStepFunction!: () => void;
  @Input() goBackToLogFunction!: () => void;

  doNextStep(){
    this.nextStepFunction();
  }

  onGoBackToLog() {
    this.goBackToLogFunction();
  }

}
