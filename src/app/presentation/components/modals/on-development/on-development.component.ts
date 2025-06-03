import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-on-development',
  imports: [CommonModule],
  templateUrl: './on-development.component.html',
  styleUrl: './on-development.component.css'
})
export class OnDevelopmentComponent {
  @Input() featureName: string = 'Esta característica';
  @Output() close = new EventEmitter<void>();
  
  closeModal(): void {
    this.close.emit();
  }
}