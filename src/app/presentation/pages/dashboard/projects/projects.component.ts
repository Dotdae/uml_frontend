import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { OptionsMenuComponent, MenuAction } from '../../../components/modals/options-menu/options-menu.component';
import { PaginatorComponent } from '../../../components/paginator/paginator.component';
import { RenameComponent } from 'src/app/presentation/components/modals/rename/rename.component';
import { DetailsComponent, ItemDetails } from 'src/app/presentation/components/modals/details/details.component';

interface Project {
  id: number;
  name: string;
  diagrams: string[];
  showOptions?: boolean;
}

@Component({
  selector: 'app-projects',
  imports: [
    CommonModule, 
    RouterLink, 
    OptionsMenuComponent, 
    PaginatorComponent,
    RenameComponent,
    DetailsComponent
  ],
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
  accentColor: 'yellow' | 'blue' | 'green' = 'yellow';
  
  // Variables para control del modal de renombrar
  showRenameModal = false;
  projectToRename: Project | null = null; // Ajusta el tipo según tu interfaz de proyectos

  // Variables para el modal de detalles
  showDetailsModal = false;
  selectedItemDetails: ItemDetails | null = null;

  constructor(private router: Router) { }

  ngOnInit() {
    // Datos de ejemplo - Reemplaza esto con datos reales de tu API
    this.allProjects = this.getMockProjects();

    // Calcular el total de páginas
    this.totalPages = Math.ceil(this.allProjects.length / this.projectsPerPage);

    // Mostrar la primera página
    this.updateDisplayedProjects();
  }

  toggleOptionsMenu(event: Event, project: Project, buttonElement: HTMLElement): void {
    event.stopPropagation();

    // Cerrar todos los demás menús abiertos
    this.displayedProjects.forEach(p => {
      if (p.id !== project.id) {
        p.showOptions = false;
      }
    });

    // Alternar el estado del menú actual
    project.showOptions = !project.showOptions;
  }

  handleOptionSelected(action: MenuAction, project: Project): void {
    project.showOptions = false;

    switch (action) {
      case 'open':
        this.router.navigate(['/dashboard/projects', project.id, 'diagrams']);
        break;
      case 'rename':
        console.log('Renombrar proyecto:', project.id);

        this.projectToRename = project;
        this.showRenameModal = true;

        break;
      case 'duplicate':
        console.log('Duplicar proyecto:', project.id);
        break;
      case 'trash':
        console.log('Mover a papelera proyecto:', project.id);
        break;
      case 'details':
        console.log('Mostrar detalles del proyecto:', project.id);
        // Crear el objeto de detalles para el proyecto
        this.selectedItemDetails = {
          id: project.id,
          name: project.name,
          type: 'project',
          location: 'En mis proyectos',
          created: this.getRandomDate(), // En producción, usarías la fecha real del proyecto
          diagramType: undefined
        };
        
        this.showDetailsModal = true;
        break;
    }
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedItemDetails = null;
  }
  
  // Método auxiliar para generar fechas aleatorias para demostración (reemplaza esto con datos reales)
  getRandomDate(): string {
    const start = new Date(2024, 0, 1);
    const end = new Date();
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString();
  }

  closeRenameModal(): void {
    this.showRenameModal = false;
    this.projectToRename = null;
  }

  closeAllMenus(): void {
    this.displayedProjects.forEach(project => {
      project.showOptions = false;
    });
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

  handleRename(data: {id: number | null, newName: string}): void {
    if (data.id !== null && this.projectToRename) {
      // Aquí implementarías la lógica para cambiar el nombre en el backend
      console.log(`Renombrando proyecto ${data.id} a "${data.newName}"`);
      
      // Actualizar en el array local (ajusta según tu estructura de datos)
      const projectIndex = this.allProjects.findIndex(p => p.id === data.id);
      if (projectIndex >= 0) {
        this.allProjects[projectIndex].name = data.newName;
        
        // Actualizar la vista si es necesario
        this.updateDisplayedProjects();
      }
      
      // Cerrar el modal
      this.closeRenameModal();
    }
  }
}