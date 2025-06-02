import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OptionsMenuComponent, MenuAction } from '../../../components/modals/options-menu/options-menu.component';
import { PaginatorComponent } from '../../../components/paginator/paginator.component';

interface Diagram {
  id: number;
  title: string;
  type: string;
  modified: string;
  showOptions?: boolean;
}

@Component({
  selector: 'app-project-diagrams',
  standalone: true,
  imports: [
    CommonModule,
    //  RouterLink,
    OptionsMenuComponent,
    PaginatorComponent
  ],
  templateUrl: './project-diagrams.component.html',
  styleUrl: './project-diagrams.component.css'
})
export class ProjectDiagramsComponent implements OnInit {
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
      { id: 2, title: 'Diagrama de Secuencia - Login prueba', type: 'secuencia', modified: '28/5/2025 0:16' },
      { id: 3, title: 'Diagrama de Componentes - Arquitectura', type: 'componentes', modified: '27/5/2025 15:22' },
      { id: 4, title: 'Diagrama de Paquetes - Estructura del proyecto', type: 'paquetes', modified: '25/5/2025 9:45' },
      { id: 5, title: 'Diagrama de Casos de Uso - Funcionalidades', type: 'casos_de_uso', modified: '24/5/2025 11:08' },
      { id: 6, title: 'Diagrama de Secuencia - Login de Usuario', type: 'secuencia', modified: '30/5/2025 1:32' },
      { id: 7, title: 'Diagrama de Secuencia - Registro de Usuario', type: 'secuencia', modified: '28/5/2025 0:16' },
      { id: 8, title: 'Diagrama de Secuencia - Recuperar Contraseña', type: 'secuencia', modified: '27/5/2025 15:22' },
      { id: 9, title: 'Diagrama de Secuencia - Crear Proyecto', type: 'secuencia', modified: '25/5/2025 9:45' },
      { id: 10, title: 'Diagrama de Secuencia - Editar Proyecto', type: 'secuencia', modified: '24/5/2025 11:08' },
      { id: 11, title: 'Diagrama de Secuencia - Eliminar Proyecto', type: 'secuencia', modified: '23/5/2025 14:22' },
      { id: 12, title: 'Diagrama de Secuencia - Compartir Proyecto', type: 'secuencia', modified: '22/5/2025 16:45' },
      { id: 13, title: 'Diagrama de Secuencia - Exportar Diagrama', type: 'secuencia', modified: '21/5/2025 10:33' },
      { id: 14, title: 'Diagrama de Secuencia - Importar Diagrama', type: 'secuencia', modified: '20/5/2025 13:15' },
      { id: 15, title: 'Diagrama de Secuencia - Generar Código', type: 'secuencia', modified: '19/5/2025 11:42' },
      { id: 16, title: 'Diagrama de Secuencia - Validar Diagrama', type: 'secuencia', modified: '18/5/2025 09:27' },
      { id: 17, title: 'Diagrama de Secuencia - Guardar Cambios', type: 'secuencia', modified: '17/5/2025 15:55' }
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
      case 'open':
        this.openDiagram(diagram.type, diagram.id);
        break;
      case 'rename':
        console.log('Renombrar diagrama:', diagram.id);
        // Implementar lógica para renombrar
        break;
      case 'duplicate':
        console.log('Duplicar diagrama:', diagram.id);
        // Implementar lógica para duplicar
        break;
      case 'trash':
        console.log('Mover a papelera diagrama:', diagram.id);
        // Implementar lógica para mover a la papelera
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

  createDiagram(): void {
    console.log('Crear nuevo diagrama para el proyecto', this.projectId);
  }

  // Método para cerrar todos los menús cuando se hace clic fuera
  closeAllMenus(): void {
    this.diagrams.forEach(diagram => {
      diagram.showOptions = false;
    });
  }
}