import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-step-4',
  imports: [],
  templateUrl: './step-4.component.html',
  styleUrl: './step-4.component.css'
})
export class Step4Component {
  @Input() goBackToLogFunction!: () => void;

  onGoBackToLog() {
    this.goBackToLogFunction();
  }

}
