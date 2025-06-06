import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { OptionsMenuComponent, MenuAction } from '../../../components/modals/options-menu/options-menu.component';
import { PaginatorComponent } from '../../../components/paginator/paginator.component';
import { SearchBarComponent } from 'src/app/presentation/components/modals/search-bar/search-bar.component';
import { RenameComponent } from 'src/app/presentation/components/modals/rename/rename.component';
import { DetailsComponent, ItemDetails } from 'src/app/presentation/components/modals/details/details.component';
import { ConfirmationComponent, ConfirmationConfig } from 'src/app/presentation/components/modals/confirmation/confirmation.component';
import { DiagramCreationComponent, DiagramCreationData } from 'src/app/presentation/components/modals/diagram-creation/diagram-creation.component';

// Import the service and models
import { DiagramService } from 'src/app/core/services/diagram.service';
import { Diagram, CreateDiagramDto, DiagramSearchFilters, getDiagramTypeName } from 'src/app/core/models/diagram.model';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
  selector: 'app-project-diagrams',
  standalone: true,
  imports: [
    CommonModule,
    //  RouterLink,
    OptionsMenuComponent,
    PaginatorComponent,
    SearchBarComponent,
    RenameComponent,
    DetailsComponent,
    ConfirmationComponent,
    DiagramCreationComponent
  ],
  templateUrl: './project-diagrams.component.html',
  styleUrl: './project-diagrams.component.css'
})
export class ProjectDiagramsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  projectId: number | null = null;
  projectName: string = '';

  // Todos los diagramas
  allDiagrams: Diagram[] = [];

  // Diagramas a mostrar en la página actual
  diagrams: Diagram[] = [];

  // Loading states
  isLoading: boolean = false;
  isCreating: boolean = false;
  isDeleting: boolean = false;
  isRenaming: boolean = false;

  // Error handling
  errorMessage: string = '';

  // Configuración del paginador
  currentPage: number = 1;
  itemsPerPage: number = 7;
  totalPages: number = 0;
  totalItems: number = 0;

  accentColor: 'yellow' | 'blue' | 'green' = 'yellow';

  // Variable para controlar el orden
  isAscendingOrder: boolean = false;
  sortBy: 'name' | 'createdAt' | 'updatedAt' = 'updatedAt';

  // Añadir estas propiedades para la búsqueda
  showSearch = false;
  searchQuery = '';
  filteredDiagrams: Diagram[] = [];
  isSearchActive = false;

  // Variables para control del modal de renombrar
  showRenameModal = false;
  diagramToRename: Diagram | null = null;

  // Variables para el modal de detalles
  showDetailsModal = false;
  selectedItemDetails: ItemDetails | null = null;

  showConfirmationModal = false;
  confirmationConfig: ConfirmationConfig = {
    type: 'generic',
    accentColor: 'yellow'
  };
  currentAction: { type: string; itemId?: number } = { type: '' };

  showDiagramCreationModal = false;

  // Property to track existing diagram types in project
  existingDiagramTypes: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private diagramService: DiagramService,
    private projectsService: ProjectsService
  ) { }

  ngOnInit() {
    // Recuperar el ID del proyecto de los parámetros de la URL
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.projectId = +params['id']; // El '+' convierte el string a número

      if (this.projectId) {
      // Establecer la ordenación descendente (más reciente primero) por defecto
      this.isAscendingOrder = false;
        this.sortBy = 'updatedAt';

        this.loadProject(this.projectId);
      this.loadProjectDiagrams(this.projectId);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProject(projectId: number) {
    this.projectsService.getProject(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project: any) => {
          this.projectName = project.projectName;
        },
        error: (error: any) => {
          console.error('Error loading project:', error);
          this.errorMessage = 'Error loading project details.';
        }
      });
  }

  loadProjectDiagrams(projectId: number) {
    this.isLoading = true;
    this.errorMessage = '';

    const filters: DiagramSearchFilters = {
      sortBy: this.sortBy,
      sortOrder: this.isAscendingOrder ? 'asc' : 'desc'
    };

    if (this.isSearchActive && this.searchQuery) {
      filters.query = this.searchQuery;
    }

    this.diagramService.getDiagramsByProject(projectId, filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (diagrams) => {
          this.allDiagrams = diagrams;
          this.totalItems = diagrams.length;

          // Update existing diagram types for modal
          this.updateExistingDiagramTypes(diagrams);

          this.updateDisplayedDiagrams();
        },
        error: (error) => {
          console.error('Error loading diagrams:', error);
          this.errorMessage = 'Error loading diagrams. Please try again.';
          this.allDiagrams = [];
          this.updateDisplayedDiagrams();
        }
      });
  }

  private updateExistingDiagramTypes(diagrams: Diagram[]) {
    // Get unique diagram types that exist in the project
    this.existingDiagramTypes = [...new Set(diagrams.map(diagram => diagram.type))];
    console.log('Existing diagram types in project:', this.existingDiagramTypes);
  }

  // Método para manejar el clic en el botón de ordenar
  toggleSortOrder(): void {
    this.isAscendingOrder = !this.isAscendingOrder;
    if (this.projectId) {
      this.loadProjectDiagrams(this.projectId);
    }
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

      this.diagrams = this.allDiagrams.slice(startIndex, endIndex);
      this.totalPages = Math.ceil(this.allDiagrams.length / this.itemsPerPage);
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
        this.diagramToRename = diagram;
        this.showRenameModal = true;
        break;
      case 'duplicate':
        this.duplicateDiagram(diagram);
        break;
      case 'trash':
        this.confirmationConfig = {
          type: 'trash',
          itemName: diagram.name,
          itemType: 'Diagrama',
          confirmButtonText: 'Mover a papelera',
          accentColor: 'red'
        };
        this.currentAction = { type: 'trash', itemId: diagram.id };
        this.showConfirmationModal = true;
        break;
      case 'details':
        this.selectedItemDetails = {
          id: diagram.id,
          name: diagram.name,
          type: 'diagram',
          location: `En ${this.projectName}`,
          created: diagram.createdAt,
          modified: diagram.updatedAt,
          diagramType: getDiagramTypeName(diagram.type)
        };
        this.showDetailsModal = true;
        break;
      case 'close':
        // Just close the menu - already handled above
        break;
    }
  }

  // Método para manejar la búsqueda
  handleSearch(query: string): void {
    this.searchQuery = query;
    this.isSearchActive = !!query.trim();
      this.currentPage = 1;

    if (this.projectId) {
      this.loadProjectDiagrams(this.projectId);
    }
  }

  // Método para iniciar la generación de código
  generateCode(): void {
    console.log('Iniciar generación de código para el proyecto', this.projectId);

    // Configurar y mostrar el modal de confirmación
    this.confirmationConfig = {
      type: 'generateCode',
      itemName: this.projectName,
      confirmButtonText: 'Generar código',
      accentColor: 'blue'
    };
    this.currentAction = { type: 'generateCode' };
    this.showConfirmationModal = true;
  }

  // Método para iniciar el proceso de generación de código
  private startCodeGeneration(): void {
    // Aquí implementarías la lógica para llamar al backend
    console.log('Iniciando generación de código para el proyecto:', this.projectId);
  }

  // Método para manejar la confirmación
  handleConfirmation(): void {
    switch (this.currentAction.type) {
      case 'trash':
        if (this.currentAction.itemId) {
          this.moveDiagramToTrash(this.currentAction.itemId);
        }
        break;

      case 'generateCode':
        this.startCodeGeneration();
        break;
    }

    this.closeConfirmationModal();
  }

  // CRUD Operations

  /**
   * Create a new diagram
   */
  createDiagram(): void {
    this.showDiagramCreationModal = true;
  }

  handleCreateDiagram(data: DiagramCreationData): void {
    if (!this.projectId) {
      this.errorMessage = 'Project ID is required';
      return;
    }

    this.isCreating = true;
    this.errorMessage = ''; // Clear any previous errors
    const createDto: CreateDiagramDto = {
      name: data.name,
      type: data.type,
      idProject: this.projectId,
      infoJson: {}
    };

    this.diagramService.createDiagram(createDto)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isCreating = false)
      )
      .subscribe({
        next: (diagram) => {
          console.log('Diagram created successfully:', diagram);
          this.closeDiagramCreationModal();
          this.loadProjectDiagrams(this.projectId!);

          // Optionally open the new diagram
          // this.openDiagram(diagram.type, diagram.id);
        },
        error: (error) => {
          console.error('Error creating diagram:', error);

          // Check if it's a validation error about duplicate diagram types
          if (error.status === 400 && error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Error creating diagram. Please try again.';
          }

          // Don't close the modal so user can see the error and try again
        }
      });
  }

  /**
   * Rename a diagram
   */
  handleRename(data: { id: number | null, newName: string }): void {
    if (!data.id) {
      this.errorMessage = 'Diagram ID is required';
      return;
    }

    this.isRenaming = true;
    this.diagramService.renameDiagram(data.id, data.newName)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isRenaming = false)
      )
      .subscribe({
        next: (diagram) => {
          console.log('Diagram renamed successfully:', diagram);
          this.closeRenameModal();

          // Update local array
          const index = this.allDiagrams.findIndex(d => d.id === data.id);
          if (index >= 0) {
            this.allDiagrams[index] = diagram;
            this.updateDisplayedDiagrams();
          }
        },
        error: (error) => {
          console.error('Error renaming diagram:', error);
          this.errorMessage = 'Error renaming diagram. Please try again.';
        }
      });
  }

  /**
   * Duplicate a diagram
   */
  duplicateDiagram(diagram: Diagram): void {
    const newName = `${diagram.name} (copy)`;

    this.diagramService.duplicateDiagram(diagram.id, newName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (duplicatedDiagram) => {
          console.log('Diagram duplicated successfully:', duplicatedDiagram);
          this.loadProjectDiagrams(this.projectId!);
        },
        error: (error) => {
          console.error('Error duplicating diagram:', error);
          this.errorMessage = 'Error duplicating diagram. Please try again.';
        }
      });
  }

  /**
   * Move diagram to trash
   */
  moveDiagramToTrash(diagramId: number): void {
    this.isDeleting = true;

    // In a real app, you'd get the current user
    const deletedBy = 'current-user-uuid';

    this.diagramService.moveDiagramToTrash(diagramId, deletedBy)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isDeleting = false)
      )
      .subscribe({
        next: () => {
          console.log('Diagram moved to trash successfully');

          // Remove from local array
          this.allDiagrams = this.allDiagrams.filter(d => d.id !== diagramId);
          this.updateDisplayedDiagrams();
        },
        error: (error) => {
          console.error('Error moving diagram to trash:', error);
          this.errorMessage = 'Error moving diagram to trash. Please try again.';
        }
      });
  }

  /**
   * Open diagram in canvas
   */
  openDiagram(type: number, id: number): void {
    const diagram = this.allDiagrams.find(d => d.id === id);

    this.router.navigate(['/canvas'], {
      queryParams: {
        projectId: this.projectId,
        diagramId: id,
        type: type,
        title: diagram ? diagram.name : 'Diagrama'
      }
    });
  }

  // Modal management methods

  closeDiagramCreationModal(): void {
    this.showDiagramCreationModal = false;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedItemDetails = null;
  }

  closeRenameModal(): void {
    this.showRenameModal = false;
    this.diagramToRename = null;
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
    this.currentAction = { type: '' };
  }

  closeAllMenus(): void {
    this.diagrams.forEach(diagram => {
      diagram.showOptions = false;
    });
    this.showSearch = false;
  }

  closeSearch(): void {
    this.showSearch = false;
  }

  // Clear error message
  clearError(): void {
    this.errorMessage = '';
  }
}
