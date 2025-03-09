import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PrimaryButtonComponent } from 'src/app/presentation/components/buttons/primary-button/primary-button.component';
import { SecondaryButtonComponent } from 'src/app/presentation/components/buttons/secondary-button/secondary-button.component';

@Component({
  selector: 'app-step-2',
  imports: [CommonModule, PrimaryButtonComponent, SecondaryButtonComponent],
  templateUrl: './step-2.component.html',
  styleUrl: './step-2.component.css'
})
export class Step2Component {
  @Input() nextStepFunction!: () => void;
  @Input() prevStepFunction!: () => void;

  code: string[] = ['', '', '', '', '', ''];
  TextPrimary = "Verificar código";
  TextSecondary = "Volver";

  handleInputChange(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Prevent non-numeric input
    if (event.key !== 'Backspace' && !/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      input.value = '';
      return;
    }

    // Handle backspace
    if (event.key === 'Backspace' && !value) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      prevInput?.focus();
      return;
    }

    // Only allow numbers
    // if (!/^\d*$/.test(value)) return;

    // Update code array
    this.code[index] = value;

    // Move to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  }

  handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text').replace(/[^0-9]/g, '');
    if (!pastedData) return;
    
    const digits = pastedData.split('').slice(0, 6);

    if (digits.length > 0) {
      digits.forEach((digit, index) => {
        if (index < 6) this.code[index] = digit;
      });

      // Focus last filled input or next empty one
      const focusIndex = Math.min(digits.length, 5);
      const nextInput = document.getElementById(`digit-${focusIndex}`);
      nextInput?.focus();
    }
  }

  handleInputValueChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    this.code[index] = input.value;
  }
}