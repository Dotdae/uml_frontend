import { Component, ElementRef, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Definimos las acciones posibles como un tipo para tener un mejor tipado
export type MenuAction = 'open' | 'rename' | 'duplicate' | 'trash' | 'details' | 'close';

@Component({
  selector: 'app-options-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './options-menu.component.html',
  styleUrl: './options-menu.component.css'
})
export class OptionsMenuComponent {
  @Input() position: 'left' | 'right' = 'right';
  @Input() triggerRect?: DOMRect;
  @Output() optionSelected = new EventEmitter<MenuAction>();
  @ViewChild('menuContent') menuContent!: ElementRef;

  ngAfterViewInit() {
    if (this.triggerRect && this.menuContent) {
      const menu = this.menuContent.nativeElement;
      const { top, right, bottom, left, height } = this.triggerRect;
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // Calcular espacio disponible
      const spaceBelow = viewport.height - bottom;
      const spaceAbove = top;
      
      // Posicionamiento horizontal
      if (this.position === 'right') {
        const rightPosition = right;
        menu.style.left = `${rightPosition - menu.offsetWidth}px`;
      } else {
        menu.style.left = `${left}px`;
      }

      // Posicionamiento vertical
      if (spaceBelow >= menu.offsetHeight || spaceBelow > spaceAbove) {
        // Mostrar debajo del botón
        menu.style.top = `${bottom + 4}px`;
      } else {
        // Mostrar encima del botón
        menu.style.top = `${top - menu.offsetHeight - 4}px`;
      }
    }
  }

  selectOption(action: MenuAction): void {
    this.optionSelected.emit(action);
  }

}