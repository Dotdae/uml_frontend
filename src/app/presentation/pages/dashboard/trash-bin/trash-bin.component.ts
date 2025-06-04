import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { OptionsMenuComponent, MenuAction } from '../../../components/modals/options-menu/options-menu.component';
import { PaginatorComponent } from 'src/app/presentation/components/paginator/paginator.component';
import { SearchBarComponent } from 'src/app/presentation/components/modals/search-bar/search-bar.component';
import { ConfirmationComponent, ConfirmationConfig } from 'src/app/presentation/components/modals/confirmation/confirmation.component';
import { TrashBinService } from '../../../../core/services/trash-bin.service';
import { AuthService } from '../../../../infrastructure/auth/auth.service';
import { TrashBin } from '../../../../core/models/project.model';
import { getDiagramTypeName } from '../../../../core/models/diagram.model';

interface TrashItem {
  id: number;
  title: string;
  type: string;
  modified: string;
  showOptions?: boolean;
  originalId: number; // Original project or diagram ID
  trashBinId: number; // ID in trash bin table
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
export class TrashBinComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Loading state
  isLoading = false;

  projectId: number | null = null;

  // Todos los elementos en papelera
  allDiagrams: TrashItem[] = [];

  // Elementos a mostrar en la página actual
  diagrams: TrashItem[] = [];

  // Configuración del paginador
  currentPage: number = 1;
  itemsPerPage: number = 7;
  totalPages: number = 0;

  accentColor: 'yellow' | 'blue' | 'green' = 'yellow';

  // Variable para controlar el orden
  isAscendingOrder: boolean = false;

  // Propiedades para la búsqueda
  showSearch = false;
  searchQuery = '';
  filteredDiagrams: TrashItem[] = [];
  isSearchActive = false;

  showConfirmationModal = false;
  confirmationConfig: ConfirmationConfig = {
    type: 'generic',
    accentColor: 'red'
  };
  currentAction: { type: string; itemId?: number } = { type: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trashBinService: TrashBinService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.isAscendingOrder = false; // Set descending order by default (most recent first)
    this.loadTrashItems();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTrashItems() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('No user ID available');
      return;
    }

    this.isLoading = true;

    this.trashBinService.getTrashByUser(userId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (trashItems: TrashBin[]) => {
          console.log('Loaded trash items:', trashItems);
          this.allDiagrams = this.mapTrashBinToTrashItems(trashItems);
          this.sortDiagrams();
          this.totalPages = Math.ceil(this.allDiagrams.length / this.itemsPerPage);
          this.updateDisplayedDiagrams();
        },
        error: (error) => {
          console.error('Error loading trash items:', error);
          // Show empty state or error message
          this.allDiagrams = [];
          this.diagrams = [];
          this.totalPages = 0;
        }
      });
  }

  private mapTrashBinToTrashItems(trashItems: TrashBin[]): TrashItem[] {
    return trashItems.map(item => {
      let title = 'Unknown Item';
      let type = 'unknown';
      let originalId = 0;

      if (item.projectId && item.project) {
        title = item.project.projectName;
        type = 'project';
        originalId = item.project.id;
      } else if (item.diagramId && item.diagram) {
        title = item.diagram.name;
        type = getDiagramTypeName(item.diagram.type);
        originalId = item.diagram.id;
      }

      return {
        id: originalId,
        title: title,
        type: type,
        modified: this.formatDate(item.deletedAt),
        originalId: originalId,
        trashBinId: item.id
      };
    });
  }

  private getDiagramTypeString(diagramType: string): string {
    const typeMap: { [key: string]: string } = {
      'Class Diagram': 'clase',
      'Sequence Diagram': 'secuencia',
      'Use Case Diagram': 'casos_de_uso',
      'Component Diagram': 'componentes',
      'Package Diagram': 'paquetes'
    };
    return typeMap[diagramType] || 'diagrama';
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();

      return `${day}/${month}/${year} ${hours}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
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

  toggleOptionsMenu(event: Event, diagram: TrashItem, buttonElement: HTMLElement): void {
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

  handleOptionSelected(action: MenuAction, diagram: TrashItem): void {
    // Cerrar el menú
    diagram.showOptions = false;

    // Manejar la acción seleccionada
    switch (action) {
      case 'restore':
        console.log('Restaurar diagrama:', diagram.trashBinId);
        // Configurar y mostrar el modal de confirmación
        this.confirmationConfig = {
          type: 'restore',
          itemName: diagram.title,
          itemType: diagram.type === 'project' ? 'Proyecto' : 'Diagrama',
          confirmButtonText: 'Restaurar',
          accentColor: 'green'
        };
        this.currentAction = { type: 'restore', itemId: diagram.trashBinId };
        this.showConfirmationModal = true;
        break;
      case 'delete':
        console.log('Eliminar permanentemente diagrama:', diagram.trashBinId);
        // Configurar y mostrar el modal de confirmación
        this.confirmationConfig = {
          type: 'delete',
          itemName: diagram.title,
          itemType: diagram.type === 'project' ? 'Proyecto' : 'Diagrama',
          confirmButtonText: 'Eliminar',
          accentColor: 'red'
        };
        this.currentAction = { type: 'delete', itemId: diagram.trashBinId };
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
      case 'restore':
        if (this.currentAction.itemId) {
          this.restoreItem(this.currentAction.itemId);
        }
        break;
      case 'delete':
        if (this.currentAction.itemId) {
          this.permanentlyDeleteItem(this.currentAction.itemId);
        }
        break;
    }

    this.closeConfirmationModal();
  }

  /**
   * Restore item from trash
   */
  restoreItem(trashBinId: number): void {
    this.trashBinService.restoreFromTrash(trashBinId)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          console.log('Item restored successfully');
          // Remove from UI immediately
          this.allDiagrams = this.allDiagrams.filter(item => item.trashBinId !== trashBinId);
          this.totalPages = Math.ceil(this.allDiagrams.length / this.itemsPerPage);
          this.updateDisplayedDiagrams();
        },
        error: (error) => {
          console.error('Error restoring item:', error);
        }
      });
  }

  /**
   * Permanently delete item from trash
   */
  permanentlyDeleteItem(trashBinId: number): void {
    this.trashBinService.permanentlyDelete(trashBinId)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          console.log('Item permanently deleted');
          // Remove from UI immediately
          this.allDiagrams = this.allDiagrams.filter(item => item.trashBinId !== trashBinId);
          this.totalPages = Math.ceil(this.allDiagrams.length / this.itemsPerPage);
          this.updateDisplayedDiagrams();
        },
        error: (error) => {
          console.error('Error permanently deleting item:', error);
        }
      });
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
