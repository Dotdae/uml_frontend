import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ConfirmationType = 'trash' | 'delete' | 'emptyTrash' | 'restore' | 'generic';

export interface ConfirmationConfig {
  type: ConfirmationType;
  title?: string;
  message?: string;
  itemName?: string;
  itemType?: 'Proyecto' | 'Diagrama';
  itemCount?: number;
  confirmButtonText?: string;
  cancelButtonText?: string;
  accentColor?: 'yellow' | 'red' | 'blue' | 'green';
}

@Component({
  selector: 'app-confirmation',
  imports: [CommonModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})

export class ConfirmationComponent {
  @Input() config: ConfirmationConfig = {
    type: 'generic',
    title: '¿Estás seguro?',
    message: 'Esta acción no se puede deshacer.',
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    accentColor: 'yellow'
  };
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  
  constructor() { }
  
  getIcon(): string {
    switch (this.config.type) {
      case 'trash':
        return 'M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z';
      case 'delete':
        return 'M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z';
      case 'emptyTrash':
        return 'M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z';
      case 'restore':
        return 'M480-80q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-440q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-800q82 0 155.5 35T760-667v-93h80v240H600v-80h110q-41-56-101.5-88T480-720q-117 0-198.5 81.5T200-440q0 117 81.5 198.5T480-160q105 0 183.5-68T757-380h82q-15 137-117.5 228.5T480-80Z';
      default:
        return 'M479.97-260q17.03 0 29.03-12t12-29q0-17-12.14-29-12.14-12-29-12-17 0-29 12.12-12 12.13-12 29Q439-284 451-272q12 12 28.97 12Zm-29.58-128.33h60.42v-291.19h-60.42v291.19ZM480.14-80q-83 0-155.69-31.5t-127-86q-54.31-54.5-85.88-127T80-480q0-83 31.56-155.69t85.88-127.5Q252-817 324.49-848.5 397-880 480-880q83 0 155.5 31.5t127 85.81q54.5 54.3 86 127T880-480q0 83-31.5 155.5t-86 127q-54.5 54.5-127 86T480.14-80Z';
    }
  }
  
  getIconColor(): string {
    switch (this.config.type) {
      case 'trash':
        return 'text-amber-500';
      case 'delete':
        return 'text-red-500';
      case 'emptyTrash':
        return 'text-red-600';
      case 'restore':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  }
  
  getButtonColor(): string {
    switch (this.config.accentColor) {
      case 'red':
        return 'bg-red-500 hover:bg-red-400';
      case 'blue':
        return 'bg-blue-500 hover:bg-blue-400';
      case 'green':
        return 'bg-green-500 hover:bg-green-400';
      default:
        return 'bg-yellow-500 hover:bg-yellow-400';
    }
  }
  
  getTitle(): string {
    if (this.config.title) return this.config.title;
    
    switch (this.config.type) {
      case 'trash':
        return `¿Mover a papelera?`;
      case 'delete':
        return `¿Eliminar permanentemente?`;
      case 'emptyTrash':
        return `¿Vaciar papelera?`;
      case 'restore':
        return `¿Restaurar elemento?`;
      default:
        return `¿Estás seguro?`;
    }
  }
  
  getMessage(): string {
    if (this.config.message) return this.config.message;
    
    switch (this.config.type) {
      case 'trash':
        return `El ${this.config.itemType?.toLowerCase() || 'elemento'} "${this.config.itemName}" será movido a la papelera.`;
      case 'delete':
        return `El ${this.config.itemType?.toLowerCase() || 'elemento'} "${this.config.itemName}" será eliminado permanentemente.`;
      case 'emptyTrash':
        const count = this.config.itemCount || 0;
        return `Se eliminarán permanentemente ${count} ${count === 1 ? 'elemento' : 'elementos'} de la papelera.`;
      case 'restore':
        return `El ${this.config.itemType?.toLowerCase() || 'elemento'} "${this.config.itemName}" será restaurado.`;
      default:
        return 'Esta acción no se puede deshacer.';
    }
  }
  
  onConfirm(): void {
    this.confirm.emit();
  }
  
  onCancel(): void {
    this.cancel.emit();
  }
}