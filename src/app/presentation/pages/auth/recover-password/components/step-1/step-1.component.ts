import { Component, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PrimaryButtonComponent } from 'src/app/presentation/components/buttons/primary-button/primary-button.component';
import { SecondaryButtonComponent } from 'src/app/presentation/components/buttons/secondary-button/secondary-button.component';

@Component({
  selector: 'app-step-1',
  imports: [PrimaryButtonComponent, SecondaryButtonComponent],
  templateUrl: './step-1.component.html',
  styleUrl: './step-1.component.css'
})
export class Step1Component {
  constructor(private router: Router){

  }

  @Output() TextPrimary = "Siguiente";
  @Output() TextSecondary = "Volver";
  @Input() nextStepFunction!: () => void;
  @Input() goBackToLogFunction!: () => void;

  doNextStep(){
      this.nextStepFunction();
  }

  onGoBackToLog() {
    this.goBackToLogFunction();
  }

}
