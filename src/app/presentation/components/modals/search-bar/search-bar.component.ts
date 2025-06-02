import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent implements AfterViewInit {
  @Input() triggerRect?: DOMRect;
  @Input() placeholder: string = 'Buscar...';
  @Input() initialValue: string = '';
  @Output() search = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();
  @ViewChild('searchContent') searchContent!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  searchText: string = '';

  ngOnInit() {
    // Inicializar con el valor proporcionado si existe
    this.searchText = this.initialValue;
  }

  ngAfterViewInit() {
    if (this.triggerRect && this.searchContent) {
      const searchBar = this.searchContent.nativeElement;
      const { top, right, bottom, left, width } = this.triggerRect;
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // Posicionamiento horizontal
      // Centrar respecto al botón que lo activó
      const searchBarWidth = searchBar.offsetWidth;
      let leftPosition = left - (searchBarWidth - width) / 2;

      // Asegurarse que no se salga de los bordes de la pantalla
      if (leftPosition < 10) {
        leftPosition = 10;
      } else if (leftPosition + searchBarWidth > viewport.width - 10) {
        leftPosition = viewport.width - searchBarWidth - 10;
      }

      searchBar.style.left = `${leftPosition}px`;

      // Posicionamiento vertical (debajo del botón)
      searchBar.style.top = `${bottom + 10}px`;

      // Enfocar el input automáticamente
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
        if (this.searchText) {
          const inputLength = this.searchText.length;
          this.searchInput.nativeElement.setSelectionRange(inputLength, inputLength);
        }
      }, 100);
    }
  }

  onSearch(): void {
    if (this.searchText.trim()) {
      this.search.emit(this.searchText.trim());
    }
  }

  onKeyup(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    } else if (event.key === 'Escape') {
      this.onClose();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  clearSearch(): void {
    this.searchText = '';
    this.search.emit('');
  }
}