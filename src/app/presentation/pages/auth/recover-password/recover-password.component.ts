import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Step1Component } from './components/step-1/step-1.component';
import { Step2Component } from './components/step-2/step-2.component';
import { Step3Component } from './components/step-3/step-3.component';
import { Step4Component } from './components/step-4/step-4.component';


@Component({
  selector: 'app-recover-password',
  imports: [Step1Component, Step2Component, Step3Component, Step4Component],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.css'
})
export class RecoverPasswordComponent {
  constructor(private router: Router){

  }

  step: number = 1;

  nextStep(){
    if (this.step < 4){
      this.step++;
    }
  }

  prevStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  goBackToLog(){
    this.router.navigate(['/auth'])
  }
}
