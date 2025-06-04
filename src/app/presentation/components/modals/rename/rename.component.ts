import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rename',
  imports: [CommonModule, FormsModule],
  templateUrl: './rename.component.html',
  styleUrl: './rename.component.css'
})
export class RenameComponent {
  @Input() itemName: string = '';
  @Input() documentType: 'Proyecto' | 'Diagrama' = 'Diagrama';
  @Input() itemId: number | null = null;
  @Input() isLoading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() rename = new EventEmitter<{id: number | null, newName: string}>();

  newName: string = '';
  errorMessage: string = '';
  originalName: string = ''; // Guardamos el nombre original para comparar

  ngOnInit() {
    // Inicializar el nuevo nombre con el nombre actual
    this.newName = this.itemName;
    this.originalName = this.itemName; // Guardar una copia del nombre original
  }

  closeModal(): void {
    if (!this.isLoading) {
      this.close.emit();
    }
  }

  renameItem(): void {
    if (this.isLoading) return;

    console.log('Renombrando item:', this.newName);
    if (this.isValidName() && this.hasChanged()) {
      this.errorMessage = '';
      this.rename.emit({
        id: this.itemId,
        newName: this.newName.trim()
      });
    } else if (!this.isValidName()) {
      this.errorMessage = `Por favor, ingresa un nombre válido para el ${this.documentType.toLowerCase()}`;
    } else if (!this.hasChanged()) {
      this.errorMessage = `El nombre debe ser diferente al actual`;
    }
  }

  isValidName(): boolean {
    return this.newName.trim().length > 0;
  }

  // Método para verificar si el nombre ha cambiado
  hasChanged(): boolean {
    return this.newName.trim() !== this.originalName.trim();
  }

  // Limpiar el mensaje de error cuando el usuario empieza a escribir
  onInputChange(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.isLoading) {
      this.renameItem();
    }
  }
}
