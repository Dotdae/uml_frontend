import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OptionsMenuComponent, MenuAction } from '../../../components/modals/options-menu/options-menu.component';
import { PaginatorComponent } from 'src/app/presentation/components/paginator/paginator.component';
import { SearchBarComponent } from 'src/app/presentation/components/modals/search-bar/search-bar.component';
import { ConfirmationComponent, ConfirmationConfig } from 'src/app/presentation/components/modals/confirmation/confirmation.component';

interface Diagram {
  id: number;
  title: string;
  type: string;
  modified: string;
  showOptions?: boolean;
}

@Component({
  selector: 'app-trash-bin',
  imports: [
    CommonModule,
    //  RouterLink,
    OptionsMenuComponent,
    PaginatorComponent,
    SearchBarComponent,
    ConfirmationComponent
  ],
  templateUrl: './trash-bin.component.html',
  styleUrl: './trash-bin.component.css'
})
export class TrashBinComponent implements OnInit {
  projectId: number | null = null;

  // Todos los diagramas
  allDiagrams: Diagram[] = [];

  // Diagramas a mostrar en la página actual
  diagrams: Diagram[] = [];

  // Configuración del paginador
  currentPage: number = 1;
  itemsPerPage: number = 7;
  totalPages: number = 0;

  accentColor: 'yellow' | 'blue' | 'green' = 'yellow';

  // Variable para controlar el orden
  isAscendingOrder: boolean = false;

  // Añadir estas propiedades para la búsqueda
  showSearch = false;
  searchQuery = '';
  filteredDiagrams: Diagram[] = [];
  isSearchActive = false;

  showConfirmationModal = false;
  confirmationConfig: ConfirmationConfig = {
    type: 'generic',
    accentColor: 'red'
  };
  currentAction: { type: string; itemId?: number } = { type: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    // Recuperar el ID del proyecto de los parámetros de la URL
    this.route.params.subscribe(params => {
      this.projectId = +params['id']; // El '+' convierte el string a número

      // Establecer la ordenación descendente (más reciente primero) por defecto
      this.isAscendingOrder = false;
      this.loadProjectDiagrams(this.projectId);
    });
  }

  loadProjectDiagrams(projectId: number) {
    // Aquí normalmente harías una llamada a un servicio para obtener los diagramas
    // Por ahora, usaremos datos de ejemplo
    this.allDiagrams = [
      { id: 1, title: 'Diagrama de Clases - Sistema de Usuarios', type: 'clase', modified: '30/5/2025 1:32' },
      { id: 2, title: 'Diagrama de Secuencia - Login', type: 'secuencia', modified: '28/5/2025 0:16' },
      { id: 3, title: 'Diagrama de Componentes - Arquitectura', type: 'componentes', modified: '27/5/2025 15:22' },
      { id: 4, title: 'Diagrama de Paquetes - Estructura del proyecto', type: 'paquetes', modified: '25/5/2025 9:45' },
      { id: 5, title: 'Diagrama de Casos de Uso - Funcionalidades', type: 'casos_de_uso', modified: '24/5/2025 11:08' },
      { id: 6, title: 'Proyecto 777', type: 'project', modified: '01/6/2025 11:08' },
      { id: 8, title: 'Diagrama de Componentes - Arquitectura', type: 'componentes', modified: '27/5/2025 15:22' },
      { id: 9, title: 'Diagrama de Paquetes - Estructura del proyecto', type: 'paquetes', modified: '25/5/2025 9:45' },
      { id: 10, title: 'Diagrama de Casos de Uso - Funcionalidades', type: 'casos_de_uso', modified: '24/5/2025 11:08' },
      { id: 11, title: 'Proyecto 777', type: 'project', modified: '01/6/2025 11:08' },
      { id: 12, title: 'Diagrama de Clases - Sistema Financiero', type: 'clase', modified: '22/5/2025 14:32' },
      { id: 13, title: 'Diagrama de Secuencia - Logout', type: 'secuencia', modified: '21/5/2025 10:19' },
      { id: 14, title: 'Diagrama de Componentes - Módulos', type: 'componentes', modified: '20/5/2025 16:42' },
      { id: 15, title: 'Diagrama de Paquetes - Dependencias', type: 'paquetes', modified: '19/5/2025 13:27' },
    ];

    // Ordenar por fecha más reciente al inicio
    this.sortDiagrams();

    // Calcular el total de páginas
    this.totalPages = Math.ceil(this.allDiagrams.length / this.itemsPerPage);

    // Mostrar la primera página
    this.updateDisplayedDiagrams();
  }

  // Nuevo método para ordenar diagramas
  sortDiagrams(): void {
    this.allDiagrams.sort((a, b) => {
      const dateA = new Date(this.convertDateFormat(a.modified));
      const dateB = new Date(this.convertDateFormat(b.modified));

      return this.isAscendingOrder
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

    // Actualizar la vista si ya hay diagramas mostrados
    if (this.diagrams.length > 0) {
      this.updateDisplayedDiagrams();
    }
  }

  // Método mejorado para convertir el formato de fecha
  private convertDateFormat(dateStr: string): string {
    try {
      // Convertir de "dd/m/yyyy h:mm" a formato que Date pueda interpretar
      const [date, time] = dateStr.split(' ');
      const [day, month, year] = date.split('/');

      // Manejar el formato de hora (que puede ser h:mm o hh:mm)
      let formattedTime = time;
      if (time.includes(':')) {
        const [hours, minutes] = time.split(':');
        formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
      }

      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${formattedTime}`;
    } catch (error) {
      console.error('Error parsing date:', dateStr, error);
      return '1970-01-01T00:00:00'; // Fecha por defecto en caso de error
    }
  }

  // Método para manejar el clic en el botón de ordenar
  toggleSortOrder(): void {
    this.isAscendingOrder = !this.isAscendingOrder;
    this.sortDiagrams();
  }

  // Método para ir a una página específica
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedDiagrams();
    }
  }

  updateDisplayedDiagrams(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    if (this.isSearchActive && this.filteredDiagrams.length > 0) {
      this.diagrams = this.filteredDiagrams.slice(startIndex, endIndex);
      this.totalPages = Math.ceil(this.filteredDiagrams.length / this.itemsPerPage);
    } else {
      this.diagrams = this.allDiagrams.slice(startIndex, endIndex);
      this.totalPages = Math.ceil(this.allDiagrams.length / this.itemsPerPage);
    }
  }

  toggleOptionsMenu(event: Event, diagram: Diagram, buttonElement: HTMLElement): void {
    event.stopPropagation();

    // Cerrar todos los demás menús abiertos
    this.diagrams.forEach(d => {
      if (d.id !== diagram.id) {
        d.showOptions = false;
      }
    });

    // Alternar el estado del menú actual
    diagram.showOptions = !diagram.showOptions;
  }

  // Método para mostrar/ocultar la barra de búsqueda
  toggleSearchBar(event: Event, buttonElement: HTMLElement): void {
    event.stopPropagation();
    this.showSearch = !this.showSearch;

    // Si cerramos la búsqueda visualmente pero hay una búsqueda activa,
    // mantenemos el estado de búsqueda
  }



  handleOptionSelected(action: MenuAction, diagram: Diagram): void {
    // Cerrar el menú
    diagram.showOptions = false;

    // Manejar la acción seleccionada
    switch (action) {
      case 'restore':
        console.log('Restaurar diagrama:', diagram.id);
        // Configurar y mostrar el modal de confirmación
        this.confirmationConfig = {
          type: 'restore',
          itemName: diagram.title,
          itemType: diagram.type === 'project' ? 'Proyecto' : 'Diagrama',
          confirmButtonText: 'Restaurar',
          accentColor: 'green'
        };
        this.currentAction = { type: 'restore', itemId: diagram.id };
        this.showConfirmationModal = true;
        break;
      case 'delete':
        console.log('Eliminar permanentemente diagrama:', diagram.id);
        // Configurar y mostrar el modal de confirmación
        this.confirmationConfig = {
          type: 'delete',
          itemName: diagram.title,
          itemType: diagram.type === 'project' ? 'Proyecto' : 'Diagrama',
          confirmButtonText: 'Eliminar',
          accentColor: 'red'
        };
        this.currentAction = { type: 'delete', itemId: diagram.id };
        this.showConfirmationModal = true;
        break;
      case 'details':
        console.log('Mostrar detalles del diagrama:', diagram.id);
        // Implementar lógica para mostrar detalles
        break;
    }
  }

  // Método para manejar la búsqueda
  handleSearch(query: string): void {
    this.searchQuery = query;

    if (query.trim()) {
      // Activar el estado de búsqueda
      this.isSearchActive = true;

      // Filtrar todos los diagramas
      const lowerQuery = query.toLowerCase();
      this.filteredDiagrams = this.allDiagrams.filter(diagram =>
        diagram.title.toLowerCase().includes(lowerQuery)
      );

      // Actualizar paginación para resultados filtrados
      this.totalPages = Math.ceil(this.filteredDiagrams.length / this.itemsPerPage);
      this.currentPage = 1;

      // Mostrar resultados filtrados
      const startIndex = 0;
      const endIndex = this.itemsPerPage;
      this.diagrams = this.filteredDiagrams.slice(startIndex, endIndex);
    } else {
      // Desactivar el estado de búsqueda
      this.isSearchActive = false;
      this.searchQuery = '';
      this.filteredDiagrams = [];

      // Restablecer la paginación
      this.totalPages = Math.ceil(this.allDiagrams.length / this.itemsPerPage);
      this.currentPage = 1;

      // Mostrar todos los diagramas
      this.updateDisplayedDiagrams();
      // Si no hay consulta, mostrar todos los diagramas
      // this.updateDisplayedDiagrams();
    }
  }

  // Método para manejar la confirmación
  handleConfirmation(): void {
    switch (this.currentAction.type) {
      case 'emptyTrash':
        console.log('Confirmado: Vaciar papelera');
        // Implementar la lógica para vaciar la papelera
        this.allDiagrams = [];
        this.filteredDiagrams = [];
        this.totalPages = 0;
        this.currentPage = 1;
        this.updateDisplayedDiagrams();
        break;
        
      case 'restore':
        console.log('Confirmado: Restaurar elemento', this.currentAction.itemId);
        // Implementar la lógica para restaurar
        if (this.currentAction.itemId) {
          this.allDiagrams = this.allDiagrams.filter(d => d.id !== this.currentAction.itemId);
          this.updateDisplayedDiagrams();
        }
        break;
        
      case 'delete':
        console.log('Confirmado: Eliminar permanentemente', this.currentAction.itemId);
        // Implementar la lógica para eliminar
        if (this.currentAction.itemId) {
          this.allDiagrams = this.allDiagrams.filter(d => d.id !== this.currentAction.itemId);
          this.updateDisplayedDiagrams();
        }
        break;
    }
    
    // Cerrar el modal
    this.closeConfirmationModal();
  }


  openDiagram(type: string, id: number): void {
    this.router.navigate(['/canvas'], {
      queryParams: {
        projectId: this.projectId,
        diagramId: id,
        type: type
      }
    });
  }

  emptyTrash(): void {
    console.log('Vaciando papelera', this.projectId);

    // Mostrar confirmación antes de vaciar
    this.confirmationConfig = {
      type: 'emptyTrash',
      itemCount: this.allDiagrams.length,
      confirmButtonText: 'Vaciar',
      accentColor: 'red'
    };
    this.currentAction = { type: 'emptyTrash' };
    this.showConfirmationModal = true;

    // Después de vaciar, reiniciar la paginación
    // this.allDiagrams = [];
    // this.totalPages = 0;
    // this.currentPage = 1;
    // this.updateDisplayedDiagrams();
  }

  // Método para cerrar todos los menús cuando se hace clic fuera
  closeAllMenus(): void {
    this.diagrams.forEach(diagram => {
      diagram.showOptions = false;
    });
    this.showSearch = false;
  }

  // Método para cerrar la búsqueda
  closeSearch(): void {
    this.showSearch = false;
    // No limpiamos la búsqueda aquí, solo cerramos el componente visualmente
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
    this.currentAction = { type: '' };
  }
}
