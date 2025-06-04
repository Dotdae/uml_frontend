import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { OptionsMenuComponent, MenuAction } from '../../../components/modals/options-menu/options-menu.component';
import { PaginatorComponent } from '../../../components/paginator/paginator.component';
import { RenameComponent } from 'src/app/presentation/components/modals/rename/rename.component';
import { DetailsComponent, ItemDetails } from 'src/app/presentation/components/modals/details/details.component';
import { ConfirmationComponent, ConfirmationConfig } from 'src/app/presentation/components/modals/confirmation/confirmation.component';
import { ProjectsService } from '../../../../core/services/projects.service';
import { TrashBinService } from '../../../../core/services/trash-bin.service';
import { StatusService } from '../../../../core/services/status.service';
import { ProjectEventsService, ProjectEvent } from '../../../../core/services/project-events.service';
import { AuthService } from '../../../../infrastructure/auth/auth.service';
import { Project, UpdateProjectDto, Status } from '../../../../core/models/project.model';

@Component({
  selector: 'app-projects',
  imports: [
    CommonModule,
    RouterLink,
    OptionsMenuComponent,
    PaginatorComponent,
    RenameComponent,
    DetailsComponent,
    ConfirmationComponent
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
  standalone: true
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Array de todos los proyectos
  allProjects: Project[] = [];

  // Proyectos a mostrar en la página actual
  displayedProjects: Project[] = [];

  // Statuses available
  statuses: Status[] = [];

  // Loading states
  isLoading = false;
  isPerformingAction = false;

  // Configuración del paginador
  currentPage: number = 1;
  projectsPerPage: number = 6;
  totalPages: number = 0;
  accentColor: 'yellow' | 'blue' | 'green' = 'yellow';

  // Variables para control del modal de renombrar
  showRenameModal = false;
  projectToRename: Project | null = null;
  isRenamingProject = false;

  // Variables para el modal de detalles
  showDetailsModal = false;
  selectedItemDetails: ItemDetails | null = null;

  showConfirmationModal = false;
  confirmationConfig: ConfirmationConfig = {
    type: 'generic',
    accentColor: 'yellow'
  };
  currentAction: { type: string; itemId?: number } = { type: '' };
  isMovingToTrash = false;

  constructor(
    private router: Router,
    private projectsService: ProjectsService,
    private trashBinService: TrashBinService,
    private statusService: StatusService,
    private projectEventsService: ProjectEventsService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.initializeData();
    this.subscribeToProjectEvents();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Subscribe to project events from other components
   */
  subscribeToProjectEvents(): void {
    this.projectEventsService.getProjectEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event: ProjectEvent) => {
          console.log('Project event received:', event);
          this.handleProjectEvent(event);
        },
        error: (error) => {
          console.error('Error handling project event:', error);
        }
      });
  }

  /**
   * Handle project events
   */
  handleProjectEvent(event: ProjectEvent): void {
    switch (event.type) {
      case 'created':
        // Add the new project to the beginning of the list
        this.allProjects.unshift(event.project);
    this.totalPages = Math.ceil(this.allProjects.length / this.projectsPerPage);

        // If we're on the first page, update the displayed projects
        if (this.currentPage === 1) {
          this.updateDisplayedProjects();
        } else {
          // Navigate to the first page to show the new project
          this.goToPage(1);
        }

        console.log(`New project "${event.project.projectName}" added to the list`);
        break;

      case 'updated':
        // Update the project in the list
        const updateIndex = this.allProjects.findIndex(p => p.id === event.project.id);
        if (updateIndex >= 0) {
          this.allProjects[updateIndex] = event.project;
          this.updateDisplayedProjects();
        }
        break;

      case 'deleted':
      case 'moved-to-trash':
        // Remove the project from the list
        this.allProjects = this.allProjects.filter(p => p.id !== event.project.id);
        this.totalPages = Math.ceil(this.allProjects.length / this.projectsPerPage);
        this.updateDisplayedProjects();
        break;
    }
  }

  /**
   * Initialize component data
   */
  initializeData(): void {
    this.isLoading = true;

    // First, seed default statuses if needed, then load projects
    this.statusService.seedDefaultStatuses()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          // After seeding, load statuses and projects
          this.loadStatuses();
          this.loadProjects();
        })
      )
      .subscribe({
        next: (statuses) => {
          console.log('Default statuses seeded:', statuses);
        },
        error: (error) => {
          console.error('Error seeding statuses:', error);
          // Continue loading even if seeding fails
          this.loadStatuses();
          this.loadProjects();
        }
      });
  }

  /**
   * Load available statuses
   */
  loadStatuses(): void {
    this.statusService.getAllStatuses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (statuses) => {
          this.statuses = statuses;
          console.log('Statuses loaded:', statuses);
        },
        error: (error) => {
          console.error('Error loading statuses:', error);
        }
      });
  }

  /**
   * Load projects from the backend
   */
  loadProjects(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('No user ID available');
      this.isLoading = false;
      return;
    }

    this.projectsService.getProjectsByUser(userId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          setTimeout(() => {
            this.isLoading = false;
          }, 600);
        })
      )
      .subscribe({
        next: (projects) => {
          // Filter projects to only show active ones (statusId 1)
          this.allProjects = projects.filter(project => project.statusId === 1);
          this.totalPages = Math.ceil(this.allProjects.length / this.projectsPerPage);
          this.updateDisplayedProjects();
          console.log('Active user projects loaded:', this.allProjects);
        },
        error: (error) => {
          console.error('Error loading user projects:', error);
          // You might want to show a user-friendly error message
        }
      });
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
        this.duplicateProject(project.id);
        break;
      case 'trash':
        console.log('Mover a papelera proyecto:', project.id);
        this.confirmationConfig = {
          type: 'trash',
          itemName: project.projectName,
          itemType: 'Proyecto',
          confirmButtonText: 'Mover a papelera',
          accentColor: 'red'
        };
        this.currentAction = { type: 'trash', itemId: project.id };
        this.showConfirmationModal = true;
        break;
      case 'details':
        console.log('Mostrar detalles del proyecto:', project.id);
        this.selectedItemDetails = {
          id: project.id,
          name: project.projectName,
          type: 'project',
          location: 'En mis proyectos',
          created: project.createdAt,
          diagramType: undefined
        };
        this.showDetailsModal = true;
        break;
    }
  }

  /**
   * Duplicate a project
   */
  duplicateProject(projectId: number): void {
    this.isPerformingAction = true;
    this.projectsService.duplicateProject(projectId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isPerformingAction = false)
      )
      .subscribe({
        next: (duplicatedProject) => {
          // Emit event for the duplicated project
          this.projectEventsService.projectCreated(duplicatedProject);
          console.log('Project duplicated successfully');
        },
        error: (error) => {
          console.error('Error duplicating project:', error);
          // Show error message to user
        }
      });
  }

  /**
   * Move project to trash
   */
  moveToTrash(projectId: number): void {
    this.isPerformingAction = true;
    this.isMovingToTrash = true;

    // Find the project to emit the event later
    const project = this.allProjects.find(p => p.id === projectId);

    // Get current user ID from auth service
    const currentUserUUID = this.authService.getUserId();
    console.log('Current user UUID:', currentUserUUID);
    if (!currentUserUUID) {
      console.error('No user ID available');
      this.isMovingToTrash = false;
      this.isPerformingAction = false;
      return;
    }

    // Add to trash bin (backend will also update project status to 2)
    const trashData = {
      projectId: projectId,
      deletedBy: currentUserUUID
    };

    this.trashBinService.addToTrash(trashData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          // Add delay for better UX, similar to other operations
          setTimeout(() => {
            this.isMovingToTrash = false;
            this.isPerformingAction = false;
            this.closeConfirmationModal();
          }, 1400);
        })
      )
      .subscribe({
        next: () => {
          // Remove project from UI immediately since it's now in trash (statusId 2)
          this.allProjects = this.allProjects.filter(p => p.id !== projectId);
          this.totalPages = Math.ceil(this.allProjects.length / this.projectsPerPage);
          this.updateDisplayedProjects();

          if (project) {
            // Emit event to notify other components
            this.projectEventsService.projectMovedToTrash(project);
          }
          console.log('Project moved to trash successfully and removed from active list');
        },
        error: (error) => {
          console.error('Error moving project to trash:', error);
          // Show error message to user
        }
      });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedItemDetails = null;
  }

  closeRenameModal(): void {
    if (!this.isRenamingProject) {
    this.showRenameModal = false;
    this.projectToRename = null;
      this.isRenamingProject = false;
    }
  }

  closeAllMenus(): void {
    this.displayedProjects.forEach(project => {
      project.showOptions = false;
    });
  }

  closeConfirmationModal(): void {
    if (!this.isMovingToTrash) {
    this.showConfirmationModal = false;
    this.currentAction = { type: '' };
      this.isMovingToTrash = false;
    }
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

  handleRename(data: { id: number | null, newName: string }): void {
    if (data.id !== null && this.projectToRename) {
      this.isRenamingProject = true;

      const updateData: UpdateProjectDto = {
        projectName: data.newName
      };

      this.projectsService.updateProject(data.id, updateData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            // Add delay for better UX, similar to project creation
            setTimeout(() => {
              this.isRenamingProject = false;
              this.closeRenameModal();
            }, 1400);
          })
        )
        .subscribe({
          next: (updatedProject) => {
            // Emit event for the updated project
            this.projectEventsService.projectUpdated(updatedProject);
            console.log('Project renamed successfully');
          },
          error: (error) => {
            console.error('Error renaming project:', error);
            // Show error message to user
          }
        });
    }
  }

  // Método para manejar la confirmación
  handleConfirmation(): void {
    switch (this.currentAction.type) {
      case 'trash':
        if (this.currentAction.itemId) {
          this.moveToTrash(this.currentAction.itemId);
        }
        break;
    }

    // Don't close modal immediately - let the operation handle that
    // this.closeConfirmationModal();
  }

  /**
   * Get diagram types from project's diagrams for display
   */
  getProjectDiagramTypes(project: Project): string[] {
    if (!project.diagrams || project.diagrams.length === 0) {
      return ['Sin diagramas'];
    }

    // Get unique diagram types
    const uniqueTypes = [...new Set(project.diagrams.map(diagram => diagram.type))];
    return uniqueTypes;
  }

  /**
   * Get default status ID (usually "Not Started")
   */
  getDefaultStatusId(): number | undefined {
    const defaultStatus = this.statuses.find(status => status.name === 'Not Started');
    return defaultStatus?.id;
  }
}
