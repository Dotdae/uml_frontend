import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Project {
  id: number;
  name: string;
  diagrams: string[];
  // otros campos que necesites
}

@Component({
  selector: 'app-projects',
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
  standalone: true
})
export class ProjectsComponent implements OnInit {
  // Array de todos los proyectos
  allProjects: Project[] = [];

  // Proyectos a mostrar en la página actual
  displayedProjects: Project[] = [];

  // Configuración del paginador
  currentPage: number = 1;
  projectsPerPage: number = 6;
  totalPages: number = 0;

  ngOnInit() {
    // Datos de ejemplo - Reemplaza esto con datos reales de tu API
    this.allProjects = this.getMockProjects();

    // Calcular el total de páginas
    this.totalPages = Math.ceil(this.allProjects.length / this.projectsPerPage);

    // Mostrar la primera página
    this.updateDisplayedProjects();
  }

  // Método para ir a una página específica
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProjects();
    }
  }

  // Método para actualizar los proyectos mostrados
  updateDisplayedProjects(): void {
    const startIndex = (this.currentPage - 1) * this.projectsPerPage;
    const endIndex = startIndex + this.projectsPerPage;
    this.displayedProjects = this.allProjects.slice(startIndex, endIndex);
  }

  // Método para obtener los números de página para el paginador
  getPageNumbers(): number[] {
    // Solo mostrar 5 números de página como máximo
    const pageNumbers: number[] = [];

    // Si hay 5 o menos páginas, mostrar todas
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        pageNumbers.push(i);
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
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  }

  // Datos de ejemplo - Reemplaza con tu servicio real
  getMockProjects(): Project[] {
    const mockProjects: Project[] = [];

    // Crear 15 proyectos de ejemplo
    for (let i = 1; i <= 15; i++) {
      const diagramTypes = ['Clase', 'Secuencia', 'Componentes', 'Paquetes', 'Casos de uso'];
      const randomDiagrams = diagramTypes
        .sort(() => 0.5 - Math.random()) // Mezclar aleatoriamente
        .slice(0, Math.floor(Math.random() * 3) + 1); // Tomar entre 1 y 3 tipos

      mockProjects.push({
        id: i,
        name: `Proyecto ${i}`,
        diagrams: randomDiagrams
      });
    }

    return mockProjects;
  }

  // Método para obtener una clase CSS según el tipo de diagrama
  getDiagramTagClass(diagramType: string): string {
    switch (diagramType.toLowerCase()) {
      case 'clase':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'secuencia':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'componentes':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'paquetes':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'casos de uso':
        return 'bg-pink-100 text-pink-800 border border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }
}