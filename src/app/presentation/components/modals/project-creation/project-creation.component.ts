import { Component, EventEmitter, Output } from '@angular/core';
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
  
  projectName: string = '';
  errorMessage: string = '';
  
  closeModal(): void {
    this.close.emit();
  }
  
  createProject(): void {
    if (this.isValidProjectName()) {
      this.create.emit(this.projectName);
    } else {
      this.errorMessage = 'Por favor, ingresa un nombre válido para el proyecto';
    }
  }
  
  isValidProjectName(): boolean {
    return this.projectName.trim().length > 0;
  }
}