import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-creation',
  imports: [CommonModule, FormsModule],
  templateUrl: './project-creation.component.html',
  styleUrl: './project-creation.component.css'
})
export class ProjectCreationComponent {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<string>();
  @Input() isLoading = false;

  projectName: string = '';
  errorMessage: string = '';

  closeModal(): void {
    if (!this.isLoading) {
      this.close.emit();
    }
  }

  createProject(): void {
    if (this.isLoading) return;

    if (this.isValidProjectName()) {
      this.errorMessage = '';
      this.create.emit(this.projectName.trim());
    } else {
      this.errorMessage = 'Por favor, ingresa un nombre válido para el proyecto';
    }
  }

  isValidProjectName(): boolean {
    return this.projectName.trim().length > 0;
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.isLoading) {
      this.createProject();
    }
  }

  clearError(): void {
    this.errorMessage = '';
  }
}
