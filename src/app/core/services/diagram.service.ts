import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  Diagram,
  CreateDiagramDto,
  UpdateDiagramDto,
  DiagramResponse,
  DiagramPaginationResponse,
  DiagramSearchFilters,
  DIAGRAM_TYPES
} from '../models/diagram.model';

@Injectable({
  providedIn: 'root'
})
export class DiagramService {
  private readonly apiUrl = 'http://localhost:3000/api/diagrams';

  constructor(private http: HttpClient) { }

  /**
   * Get all diagrams with pagination and filtering
   */
  getDiagrams(filters: DiagramSearchFilters = {}): Observable<DiagramPaginationResponse> {
    let params = new HttpParams();

    if (filters.query) params = params.set('query', filters.query);
    if (filters.type) params = params.set('type', filters.type.toString());
    if (filters.projectId) params = params.set('projectId', filters.projectId.toString());
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this.http.get<DiagramPaginationResponse>(this.apiUrl, { params }).pipe(
      map(response => ({
        ...response,
        diagrams: response.diagrams.map(diagram => ({
          ...diagram,
          showOptions: false
        }))
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Get diagrams by project ID
   */
  getDiagramsByProject(projectId: number, filters: DiagramSearchFilters = {}): Observable<Diagram[]> {
    let params = new HttpParams();

    // Add projectId as query parameter
    params = params.set('projectId', projectId.toString());

    if (filters.query) params = params.set('query', filters.query);
    if (filters.type) params = params.set('type', filters.type.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    const apiUrl = this.apiUrl; // Use base URL with projectId as query param

    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map(diagrams => {
        const mappedDiagrams = diagrams.map(diagram => {
          // Map backend field names to frontend field names
          const mappedDiagram: Diagram = {
            id: diagram.id,
            name: diagram.name,
            type: diagram.type,
            projectId: diagram.idProject, // Backend uses idProject
            infoJson: typeof diagram.infoJson === 'object' ? JSON.stringify(diagram.infoJson) : (diagram.infoJson || '{}'),
            version: diagram.version || 1,
            createdAt: diagram.createdAt || diagram.project?.createdAt || new Date().toISOString(),
            updatedAt: diagram.updatedAt || diagram.project?.updatedAt || new Date().toISOString(),
            showOptions: false
          };

          return mappedDiagram;
        });

        console.log('Final mapped diagrams:', mappedDiagrams);
        return mappedDiagrams;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  /**
   * Get a specific diagram by ID
   */
  getDiagram(id: number): Observable<Diagram> {
    // Add detailed logging for debugging
    console.log('=== DEBUG: Getting single diagram ===');
    console.log('Diagram ID:', id);
    console.log('API URL:', `${this.apiUrl}/${id}`);

    console.log('Making GET request to get single diagram...');

    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(diagram => {
        console.log('Raw backend response for single diagram:', diagram);

        // Map backend field names to frontend field names
        const mappedDiagram: Diagram = {
          id: diagram.id,
          name: diagram.name,
          type: diagram.type,
          projectId: diagram.idProject, // Backend uses idProject
          infoJson: typeof diagram.infoJson === 'object' ? JSON.stringify(diagram.infoJson) : (diagram.infoJson || '{}'),
          version: diagram.version || 1,
          createdAt: diagram.createdAt || diagram.project?.createdAt || new Date().toISOString(),
          updatedAt: diagram.updatedAt || diagram.project?.updatedAt || new Date().toISOString(),
          showOptions: false
        };

        console.log('Mapped diagram:', mappedDiagram);
        return mappedDiagram;
      }),
      catchError(error => {
        console.error('=== API ERROR when getting single diagram ===');
        console.error('Error details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Create a new diagram
   */
  createDiagram(diagramData: CreateDiagramDto): Observable<Diagram> {
    // Add detailed logging for debugging
    console.log('=== DEBUG: Creating diagram ===');
    console.log('Data being sent to backend:', diagramData);
    console.log('API URL:', this.apiUrl);

    // Ensure infoJson is always an object, not undefined
    const requestData = {
      ...diagramData,
      infoJson: diagramData.infoJson || {} // Provide empty object if not provided
    };

    // Add more detailed logging for the actual API call
    console.log('Making POST request to:', this.apiUrl);
    console.log('Request body:', JSON.stringify(requestData, null, 2));

    return this.http.post<any>(this.apiUrl, requestData).pipe(
      map(diagram => {
        console.log('Backend response:', diagram);

        // Map backend field names to frontend field names
        const mappedDiagram: Diagram = {
          id: diagram.id,
          name: diagram.name,
          type: diagram.type,
          projectId: diagram.idProject, // Backend uses idProject
          infoJson: typeof diagram.infoJson === 'object' ? JSON.stringify(diagram.infoJson) : (diagram.infoJson || '{}'),
          version: diagram.version || 1,
          createdAt: diagram.createdAt || diagram.project?.createdAt || new Date().toISOString(),
          updatedAt: diagram.updatedAt || diagram.project?.updatedAt || new Date().toISOString(),
          showOptions: false
        };

        console.log('Mapped created diagram:', mappedDiagram);
        return mappedDiagram;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  /*
  * Get the count of diagrams for the authenticated user
  */
  getDiagramCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing diagram
   */
  updateDiagram(id: number, diagramData: UpdateDiagramDto): Observable<Diagram> {
    return this.http.patch<DiagramResponse>(`${this.apiUrl}/${id}`, diagramData).pipe(
      map(diagram => ({
        ...diagram,
        showOptions: false
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Update diagram content (for canvas saves)
   */
  updateDiagramContent(id: number, content: string): Observable<Diagram> {
    return this.updateDiagram(id, { infoJson: content });
  }

  /**
   * Rename a diagram
   */
  renameDiagram(id: number, newName: string): Observable<Diagram> {
    return this.updateDiagram(id, { name: newName });
  }

  /**
   * Delete a diagram (hard delete)
   */
  deleteDiagram(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Move diagram to trash (soft delete)
   */
  moveDiagramToTrash(id: number, deletedBy: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/trash`, { deletedBy }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Restore diagram from trash
   */
  restoreDiagramFromTrash(id: number): Observable<Diagram> {
    return this.http.patch<DiagramResponse>(`${this.apiUrl}/${id}/restore`, {}).pipe(
      map(diagram => ({
        ...diagram,
        showOptions: false
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Duplicate a diagram
   */
  duplicateDiagram(id: number, newName?: string): Observable<Diagram> {
    const body = newName ? { name: newName } : {};
    return this.http.post<DiagramResponse>(`${this.apiUrl}/${id}/duplicate`, body).pipe(
      map(diagram => ({
        ...diagram,
        showOptions: false
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Export diagram data
   */
  exportDiagram(id: number, format: 'json' | 'xml' | 'png' | 'svg' = 'json'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`${this.apiUrl}/${id}/export`, {
      params,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Import diagram from file
   */
  importDiagram(projectId: number, file: File, name?: string): Observable<Diagram> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId.toString());
    if (name) {
      formData.append('name', name);
    }

    return this.http.post<DiagramResponse>(`${this.apiUrl}/import`, formData).pipe(
      map(diagram => ({
        ...diagram,
        showOptions: false
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Search diagrams across all projects
   */
  searchDiagrams(query: string, filters: DiagramSearchFilters = {}): Observable<Diagram[]> {
    const searchFilters: DiagramSearchFilters = {
      ...filters,
      query
    };

    return this.getDiagrams(searchFilters).pipe(
      map(response => response.diagrams)
    );
  }

  /**
   * Get diagram statistics for a project
   */
  getDiagramStats(projectId: number): Observable<{ total: number; byType: Record<string, number> }> {
    return this.http.get<{ total: number; byType: Record<string, number> }>(
      `${this.apiUrl}/project/${projectId}/stats`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Validate diagram content
   */
  validateDiagram(id: number): Observable<{ isValid: boolean; errors: string[] }> {
    return this.http.post<{ isValid: boolean; errors: string[] }>(
      `${this.apiUrl}/${id}/validate`, {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Error handler
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Bad request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'Forbidden. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Diagram not found.';
          break;
        case 409:
          errorMessage = 'Conflict. A diagram with this name already exists.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    console.error('DiagramService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
