import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { DiagramService } from './diagram.service';
import {
  Diagram,
  CreateDiagramDto,
  UpdateDiagramDto,
  DiagramSearchFilters
} from '../models/diagram.model';

/**
 * DiagramManagementService
 *
 * A higher-level service that provides additional functionality on top of the DiagramService:
 * - State management (current diagram, selected project's diagrams)
 * - Caching for better performance
 * - Business logic
 * - Error handling
 */
@Injectable({
  providedIn: 'root'
})
export class DiagramManagementService {
  // Active diagram state
  private currentDiagramSubject = new BehaviorSubject<Diagram | null>(null);
  currentDiagram$ = this.currentDiagramSubject.asObservable();

  // Project diagrams state
  private projectDiagramsSubject = new BehaviorSubject<Diagram[]>([]);
  projectDiagrams$ = this.projectDiagramsSubject.asObservable();

  // Active project ID
  private currentProjectIdSubject = new BehaviorSubject<number | null>(null);
  currentProjectId$ = this.currentProjectIdSubject.asObservable();

  // Loading states
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  // Error state
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  // Cache timeouts (in milliseconds)
  private readonly PROJECT_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private readonly DIAGRAM_CACHE_TIMEOUT = 2 * 60 * 1000; // 2 minutes

  // Cache storage
  private projectDiagramsCache: Map<number, {
    data: Diagram[],
    timestamp: number
  }> = new Map();

  private diagramCache: Map<number, {
    data: Diagram,
    timestamp: number
  }> = new Map();

  // Auto-save related
  private autoSaveEnabled = true;
  private autoSaveInterval = 30000; // 30 seconds
  private autoSaveTimer: any;
  private pendingChanges = false;

  constructor(private diagramService: DiagramService) {}

  /**
   * Load diagrams for a specific project
   */
  loadProjectDiagrams(projectId: number, filters: DiagramSearchFilters = {}): Observable<Diagram[]> {
    this.currentProjectIdSubject.next(projectId);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Check cache first
    const cachedData = this.projectDiagramsCache.get(projectId);
    const now = Date.now();

    if (cachedData && (now - cachedData.timestamp < this.PROJECT_CACHE_TIMEOUT)) {
      // Apply filters to cached data
      let filteredData = [...cachedData.data];

      if (filters.query) {
        const query = filters.query.toLowerCase();
        filteredData = filteredData.filter(d => d.name.toLowerCase().includes(query));
      }

      if (filters.type) {
        filteredData = filteredData.filter(d => d.type === filters.type);
      }

      // Apply sorting
      if (filters.sortBy) {
        filteredData.sort((a, b) => {
          const aValue = a[filters.sortBy as keyof Diagram] as string;
          const bValue = b[filters.sortBy as keyof Diagram] as string;

          if (filters.sortOrder === 'desc') {
            return bValue.localeCompare(aValue);
          }
          return aValue.localeCompare(bValue);
        });
      }

      this.projectDiagramsSubject.next(filteredData);
      this.loadingSubject.next(false);
      return of(filteredData);
    }

    // If not in cache or expired, fetch from service
    return this.diagramService.getDiagramsByProject(projectId, filters).pipe(
      tap(diagrams => {
        // Update cache
        this.projectDiagramsCache.set(projectId, {
          data: diagrams,
          timestamp: Date.now()
        });

        // Update state
        this.projectDiagramsSubject.next(diagrams);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next(error.message || 'Error loading diagrams');
        return throwError(() => error);
      }),
      shareReplay(1)
    );
  }

  /**
   * Load a specific diagram by ID
   */
  loadDiagram(id: number): Observable<Diagram> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Check cache first
    const cachedData = this.diagramCache.get(id);
    const now = Date.now();

    if (cachedData && (now - cachedData.timestamp < this.DIAGRAM_CACHE_TIMEOUT)) {
      this.currentDiagramSubject.next(cachedData.data);
      this.loadingSubject.next(false);
      return of(cachedData.data);
    }

    // If not in cache or expired, fetch from service
    return this.diagramService.getDiagram(id).pipe(
      tap(diagram => {
        // Update cache
        this.diagramCache.set(id, {
          data: diagram,
          timestamp: Date.now()
        });

        // Update state
        this.currentDiagramSubject.next(diagram);
        this.loadingSubject.next(false);

        // Start auto-save if enabled
        if (this.autoSaveEnabled) {
          this.startAutoSave(id);
        }
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next(error.message || `Error loading diagram with ID ${id}`);
        return throwError(() => error);
      }),
      shareReplay(1)
    );
  }

  /**
   * Create a new diagram
   */
  createDiagram(diagramData: CreateDiagramDto): Observable<Diagram> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.diagramService.createDiagram(diagramData).pipe(
      tap(diagram => {
        // Update current diagram
        this.currentDiagramSubject.next(diagram);

        // Update project diagrams if this is for the current project
        if (diagramData.idProject === this.currentProjectIdSubject.value) {
          const currentDiagrams = this.projectDiagramsSubject.value;
          this.projectDiagramsSubject.next([diagram, ...currentDiagrams]);

          // Update cache
          this.projectDiagramsCache.set(diagramData.idProject, {
            data: [diagram, ...currentDiagrams],
            timestamp: Date.now()
          });
        }

        // Cache the new diagram
        this.diagramCache.set(diagram.id, {
          data: diagram,
          timestamp: Date.now()
        });

        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next(error.message || 'Error creating diagram');
        return throwError(() => error);
      })
    );
  }

  /**
   * Update diagram content
   */
  updateDiagramContent(id: number, content: string): Observable<Diagram> {
    this.pendingChanges = false;

    return this.diagramService.updateDiagramContent(id, content).pipe(
      tap(diagram => {
        // Update cache
        this.diagramCache.set(id, {
          data: diagram,
          timestamp: Date.now()
        });

        // Update current diagram
        this.currentDiagramSubject.next(diagram);

        // Update in project diagrams if present
        this.updateDiagramInProjectList(diagram);
      }),
      catchError(error => {
        this.errorSubject.next(error.message || `Error updating diagram content for ID ${id}`);
        return throwError(() => error);
      })
    );
  }

  /**
   * Rename a diagram
   */
  renameDiagram(id: number, newName: string): Observable<Diagram> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.diagramService.renameDiagram(id, newName).pipe(
      tap(diagram => {
        // Update cache
        this.diagramCache.set(id, {
          data: diagram,
          timestamp: Date.now()
        });

        // Update current diagram if it's the one being renamed
        const currentDiagram = this.currentDiagramSubject.value;
        if (currentDiagram && currentDiagram.id === id) {
          this.currentDiagramSubject.next(diagram);
        }

        // Update in project diagrams if present
        this.updateDiagramInProjectList(diagram);

        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next(error.message || `Error renaming diagram with ID ${id}`);
        return throwError(() => error);
      })
    );
  }

  /**
   * Duplicate a diagram
   */
  duplicateDiagram(id: number, newName?: string): Observable<Diagram> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.diagramService.duplicateDiagram(id, newName).pipe(
      tap(diagram => {
        // Cache the new diagram
        this.diagramCache.set(diagram.id, {
          data: diagram,
          timestamp: Date.now()
        });

        // Update project diagrams if this is for the current project
        const currentProjectId = this.currentProjectIdSubject.value;
        if (diagram.projectId === currentProjectId) {
          const currentDiagrams = this.projectDiagramsSubject.value;
          this.projectDiagramsSubject.next([diagram, ...currentDiagrams]);

          // Update cache
          if (currentProjectId) {
            this.projectDiagramsCache.set(currentProjectId, {
              data: [diagram, ...currentDiagrams],
              timestamp: Date.now()
            });
          }
        }

        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next(error.message || `Error duplicating diagram with ID ${id}`);
        return throwError(() => error);
      })
    );
  }

  /**
   * Move diagram to trash
   */
  moveDiagramToTrash(id: number, deletedBy: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.diagramService.moveDiagramToTrash(id, deletedBy).pipe(
      tap(() => {
        // Remove from cache
        this.diagramCache.delete(id);

        // Update current diagram if it's the one being deleted
        const currentDiagram = this.currentDiagramSubject.value;
        if (currentDiagram && currentDiagram.id === id) {
          this.currentDiagramSubject.next(null);
          this.stopAutoSave();
        }

        // Remove from project diagrams if present
        const projectDiagrams = this.projectDiagramsSubject.value;
        const updatedDiagrams = projectDiagrams.filter(d => d.id !== id);
        this.projectDiagramsSubject.next(updatedDiagrams);

        // Update cache for current project
        const currentProjectId = this.currentProjectIdSubject.value;
        if (currentProjectId) {
          const cachedData = this.projectDiagramsCache.get(currentProjectId);
          if (cachedData) {
            this.projectDiagramsCache.set(currentProjectId, {
              data: cachedData.data.filter(d => d.id !== id),
              timestamp: Date.now()
            });
          }
        }

        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        this.errorSubject.next(error.message || `Error moving diagram with ID ${id} to trash`);
        return throwError(() => error);
      })
    );
  }

  /**
   * Set the current working diagram
   */
  setCurrentDiagram(diagram: Diagram | null): void {
    this.currentDiagramSubject.next(diagram);

    // Stop auto-save for previous diagram
    this.stopAutoSave();

    // Start auto-save for new diagram if applicable
    if (diagram && this.autoSaveEnabled) {
      this.startAutoSave(diagram.id);
    }
  }

  /**
   * Get the current diagram
   */
  getCurrentDiagram(): Diagram | null {
    return this.currentDiagramSubject.value;
  }

  /**
   * Clear the error
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Clear cache for a specific project
   */
  clearProjectCache(projectId: number): void {
    this.projectDiagramsCache.delete(projectId);
  }

  /**
   * Clear cache for a specific diagram
   */
  clearDiagramCache(id: number): void {
    this.diagramCache.delete(id);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.projectDiagramsCache.clear();
    this.diagramCache.clear();
  }

  /**
   * Set auto-save configuration
   */
  setAutoSaveConfig(enabled: boolean, interval?: number): void {
    this.autoSaveEnabled = enabled;

    if (interval) {
      this.autoSaveInterval = interval;
    }

    // If disabled, stop any current auto-save
    if (!enabled) {
      this.stopAutoSave();
    } else {
      // If enabled and there's a current diagram, start auto-save
      const currentDiagram = this.currentDiagramSubject.value;
      if (currentDiagram) {
        this.startAutoSave(currentDiagram.id);
      }
    }
  }

  /**
   * Mark that there are pending changes to be saved
   */
  markAsPendingChanges(): void {
    this.pendingChanges = true;
  }

  /**
   * Export diagram
   */
  exportDiagram(id: number, format: 'json' | 'xml' | 'png' | 'svg' = 'json'): Observable<Blob> {
    return this.diagramService.exportDiagram(id, format).pipe(
      catchError(error => {
        this.errorSubject.next(error.message || `Error exporting diagram with ID ${id}`);
        return throwError(() => error);
      })
    );
  }

  // Private helper methods

  /**
   * Update a diagram in the project list if it exists
   */
  private updateDiagramInProjectList(diagram: Diagram): void {
    const projectDiagrams = this.projectDiagramsSubject.value;
    const index = projectDiagrams.findIndex(d => d.id === diagram.id);

    if (index >= 0) {
      const updatedDiagrams = [...projectDiagrams];
      updatedDiagrams[index] = diagram;
      this.projectDiagramsSubject.next(updatedDiagrams);

      // Update cache for current project
      const currentProjectId = this.currentProjectIdSubject.value;
      if (currentProjectId) {
        const cachedData = this.projectDiagramsCache.get(currentProjectId);
        if (cachedData) {
          const updatedCacheData = [...cachedData.data];
          const cacheIndex = updatedCacheData.findIndex(d => d.id === diagram.id);
          if (cacheIndex >= 0) {
            updatedCacheData[cacheIndex] = diagram;
            this.projectDiagramsCache.set(currentProjectId, {
              data: updatedCacheData,
              timestamp: Date.now()
            });
          }
        }
      }
    }
  }

  /**
   * Start auto-save for a diagram
   */
  private startAutoSave(diagramId: number): void {
    this.stopAutoSave(); // Stop any existing auto-save first

    this.autoSaveTimer = setInterval(() => {
      if (this.pendingChanges) {
        const currentDiagram = this.currentDiagramSubject.value;
        if (currentDiagram && currentDiagram.id === diagramId && currentDiagram.infoJson) {
          console.log('Auto-saving diagram...', diagramId);
          this.updateDiagramContent(diagramId, currentDiagram.infoJson).subscribe({
            next: () => console.log('Auto-save successful'),
            error: err => console.error('Auto-save failed', err)
          });
        }
      }
    }, this.autoSaveInterval);
  }

  /**
   * Stop auto-save
   */
  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}
