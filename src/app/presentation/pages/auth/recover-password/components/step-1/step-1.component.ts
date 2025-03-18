import { Component, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestResetPasswordUseCase } from '@application/auth/requestResetPassword.usecase';
import { PrimaryButtonComponent } from 'src/app/presentation/components/buttons/primary-button/primary-button.component';
import { SecondaryButtonComponent } from 'src/app/presentation/components/buttons/secondary-button/secondary-button.component';

import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-step-1',
  imports: [PrimaryButtonComponent, SecondaryButtonComponent, FormsModule],
  templateUrl: './step-1.component.html',
  styleUrl: './step-1.component.css'
})
export class Step1Component {
  constructor(
    private router: Router,
    private requestPassworsUseCase: RequestResetPasswordUseCase) { }

  private toast = inject(HotToastService);
  public email: string = '';
  @Output() TextPrimary = "Siguiente";
  @Output() TextSecondary = "Volver";
  @Input() nextStepFunction!: () => void;
  @Input() goBackToLogFunction!: () => void;

  doNextStep() {
    this.nextStepFunction();
  }


  public async requestPassword() {
    const success = await this.requestPassworsUseCase.execute(this.email);
    if (success) {
      this.doNextStep();
    } else {
      this.toast.error("Correo no encontrado.")
      console.error('reset failed');
    }
  }

  onGoBackToLog() {
    this.goBackToLogFunction();
  }

}
