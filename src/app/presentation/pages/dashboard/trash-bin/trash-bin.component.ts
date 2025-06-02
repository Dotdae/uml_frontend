import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OptionsMenuComponent, MenuAction } from '../../../components/modals/options-menu/options-menu.component';
import { PaginatorComponent } from 'src/app/presentation/components/paginator/paginator.component';

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
    PaginatorComponent
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

  // Método para actualizar los diagramas mostrados
  updateDisplayedDiagrams(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.diagrams = this.allDiagrams.slice(startIndex, endIndex);
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

  handleOptionSelected(action: MenuAction, diagram: Diagram): void {
    // Cerrar el menú
    diagram.showOptions = false;

    // Manejar la acción seleccionada
    switch (action) {
      case 'restore':
        console.log('Restaurar diagrama:', diagram.id);
        // Implementar lógica para restaurar
        break;
      case 'delete':
        console.log('Eliminar permanentemente diagrama:', diagram.id);
        // Implementar lógica para eliminar permanentemente
        break;
      case 'details':
        console.log('Mostrar detalles del diagrama:', diagram.id);
        // Implementar lógica para mostrar detalles
        break;
    }
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

    // Después de vaciar, reiniciar la paginación
    this.allDiagrams = [];
    this.totalPages = 0;
    this.currentPage = 1;
    this.updateDisplayedDiagrams();
  }

  // Método para cerrar todos los menús cuando se hace clic fuera
  closeAllMenus(): void {
    this.diagrams.forEach(diagram => {
      diagram.showOptions = false;
    });
  }
}
