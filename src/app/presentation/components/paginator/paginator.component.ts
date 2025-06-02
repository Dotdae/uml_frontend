import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  imports: [CommonModule],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.css'
})

export class PaginatorComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() accentColor: 'yellow' | 'blue' | 'green' = 'yellow';
  @Output() pageChanged = new EventEmitter<number>();

  pageNumbers: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalPages'] || changes['currentPage']) {
      this.generatePageNumbers();
    }
  }

  generatePageNumbers(): void {
    this.pageNumbers = [];
    
    // Si hay 5 o menos páginas, mostrar todas
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        this.pageNumbers.push(i);
      }
    } else {
      // Si hay más de 5 páginas, mostrar la actual y algunas alrededor
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, startPage + 4);

      // Ajustar si estamos cerca del final
      if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
      }

      for (let i = startPage; i <= endPage; i++) {
        this.pageNumbers.push(i);
      }
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChanged.emit(page);
    }
  }

  get colorClasses() {
    const colors = {
      'yellow': {
        active: 'bg-yellow-500 border-yellow-500 hover:bg-yellow-400',
        text: 'text-white'
      },
      'blue': {
        active: 'bg-blue-500 border-blue-500 hover:bg-blue-400',
        text: 'text-white'
      },
      'green': {
        active: 'bg-green-500 border-green-500 hover:bg-green-400',
        text: 'text-white'
      }
    };
    
    return colors[this.accentColor];
  }
}
