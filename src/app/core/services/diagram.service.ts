import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of, delay } from 'rxjs';
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

  // Toggle this to use mock data instead of real API calls
  private readonly useMockData = false; // Set to true temporarily for debugging

  // Mock data for development
  private mockDiagrams: Diagram[] = [
    {
      id: 1,
      name: 'User Management Class Diagram',
      type: DIAGRAM_TYPES.CLASS,
      projectId: 1,
      infoJson: JSON.stringify({
        elements: [
          { id: 'e1', type: 'class', name: 'User', attributes: ['id: number', 'name: string', 'email: string'] },
          { id: 'e2', type: 'class', name: 'Role', attributes: ['id: number', 'name: string'] }
        ],
        connections: [
          { id: 'c1', from: 'e1', to: 'e2', type: 'association' }
        ]
      }),
      version: 1,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T15:30:00Z',
      showOptions: false
    },
    {
      id: 2,
      name: 'Login Sequence Diagram',
      type: DIAGRAM_TYPES.SEQUENCE,
      projectId: 1,
      infoJson: JSON.stringify({
        actors: [
          { id: 'a1', name: 'User' },
          { id: 'a2', name: 'Frontend' },
          { id: 'a3', name: 'AuthService' }
        ],
        messages: [
          { id: 'm1', from: 'a1', to: 'a2', text: 'Login(username, password)' },
          { id: 'm2', from: 'a2', to: 'a3', text: 'Authenticate()' }
        ]
      }),
      version: 1,
      createdAt: '2024-01-14T09:00:00Z',
      updatedAt: '2024-01-14T16:45:00Z',
      showOptions: false
    },
    {
      id: 3,
      name: 'System Architecture Package Diagram',
      type: DIAGRAM_TYPES.PACKAGE,
      projectId: 1,
      infoJson: JSON.stringify({
        packages: [
          { id: 'p1', name: 'Frontend', children: ['p3', 'p4'] },
          { id: 'p2', name: 'Backend', children: ['p5', 'p6'] },
          { id: 'p3', name: 'UI Components' },
          { id: 'p4', name: 'Services' },
          { id: 'p5', name: 'API Controllers' },
          { id: 'p6', name: 'Database' }
        ],
        dependencies: [
          { from: 'p4', to: 'p5' }
        ]
      }),
      version: 1,
      createdAt: '2024-01-13T11:00:00Z',
      updatedAt: '2024-01-13T14:20:00Z',
      showOptions: false
    },
    {
      id: 4,
      name: 'User Stories Use Case Diagram',
      type: DIAGRAM_TYPES.USECASE,
      projectId: 2,
      infoJson: JSON.stringify({
        actors: [
          { id: 'a1', name: 'User' },
          { id: 'a2', name: 'Admin' }
        ],
        useCases: [
          { id: 'uc1', name: 'Login' },
          { id: 'uc2', name: 'Register' },
          { id: 'uc3', name: 'Manage Projects' }
        ],
        relationships: [
          { actor: 'a1', useCase: 'uc1' },
          { actor: 'a1', useCase: 'uc2' },
          { actor: 'a2', useCase: 'uc3' }
        ]
      }),
      version: 1,
      createdAt: '2024-01-12T08:00:00Z',
      updatedAt: '2024-01-12T17:10:00Z',
      showOptions: false
    },
    {
      id: 5,
      name: 'Component Architecture Diagram',
      type: DIAGRAM_TYPES.COMPONENTS,
      projectId: 2,
      infoJson: JSON.stringify({
        components: [
          { id: 'c1', name: 'AuthService', interfaces: ['login', 'logout'] },
          { id: 'c2', name: 'UserManager', interfaces: ['getUsers', 'createUser'] },
          { id: 'c3', name: 'ProjectService', interfaces: ['getProjects', 'createProject'] }
        ],
        dependencies: [
          { from: 'c2', to: 'c1' },
          { from: 'c3', to: 'c2' }
        ]
      }),
      version: 1,
      createdAt: '2024-01-11T13:00:00Z',
      updatedAt: '2024-01-11T18:25:00Z',
      showOptions: false
    }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Get all diagrams with pagination and filtering
   */
  getDiagrams(filters: DiagramSearchFilters = {}): Observable<DiagramPaginationResponse> {
    if (this.useMockData) {
      return this.getMockDiagrams(filters);
    }

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
    // Add detailed logging for debugging
    console.log('=== DEBUG: Getting diagrams by project ===');
    console.log('Project ID:', projectId);
    console.log('Filters:', filters);
    console.log('useMockData:', this.useMockData);

    if (this.useMockData) {
      return this.getMockDiagramsByProject(projectId, filters);
    }

    let params = new HttpParams();

    // Add projectId as query parameter
    params = params.set('projectId', projectId.toString());

    if (filters.query) params = params.set('query', filters.query);
    if (filters.type) params = params.set('type', filters.type.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    const apiUrl = this.apiUrl; // Use base URL with projectId as query param
    console.log('API URL:', apiUrl);
    console.log('Query params:', params.toString());

    console.log('Making GET request to get project diagrams...');

    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map(diagrams => {
        console.log('Raw backend response for project diagrams:', diagrams);

        const mappedDiagrams = diagrams.map(diagram => {
          console.log('Mapping diagram:', diagram);

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
        });

        console.log('Final mapped diagrams:', mappedDiagrams);
        return mappedDiagrams;
      }),
      catchError(error => {
        console.error('=== API ERROR when getting project diagrams ===');
        console.error('Error details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
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
    console.log('useMockData:', this.useMockData);

    if (this.useMockData) {
      return this.getMockDiagram(id);
    }

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
    console.log('useMockData:', this.useMockData);

    if (this.useMockData) {
      return this.createMockDiagram(diagramData);
    }

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
        console.error('=== API ERROR ===');
        console.error('Error details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Update an existing diagram
   */
  updateDiagram(id: number, diagramData: UpdateDiagramDto): Observable<Diagram> {
    if (this.useMockData) {
      return this.updateMockDiagram(id, diagramData);
    }

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
    if (this.useMockData) {
      return this.deleteMockDiagram(id);
    }

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Move diagram to trash (soft delete)
   */
  moveDiagramToTrash(id: number, deletedBy: string): Observable<void> {
    if (this.useMockData) {
      return this.deleteMockDiagram(id);
    }

    return this.http.patch<void>(`${this.apiUrl}/${id}/trash`, { deletedBy }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Restore diagram from trash
   */
  restoreDiagramFromTrash(id: number): Observable<Diagram> {
    if (this.useMockData) {
      return this.getMockDiagram(id);
    }

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
    if (this.useMockData) {
      return this.duplicateMockDiagram(id, newName);
    }

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
    if (this.useMockData) {
      return this.exportMockDiagram(id, format);
    }

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
    if (this.useMockData) {
      return this.importMockDiagram(projectId, file, name);
    }

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
    if (this.useMockData) {
      return this.getMockDiagramStats(projectId);
    }

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
    if (this.useMockData) {
      return this.validateMockDiagram(id);
    }

    return this.http.post<{ isValid: boolean; errors: string[] }>(
      `${this.apiUrl}/${id}/validate`, {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Mock data methods for development

  private getMockDiagrams(filters: DiagramSearchFilters): Observable<DiagramPaginationResponse> {
    let filteredDiagrams = [...this.mockDiagrams];

    // Apply filters
    if (filters.projectId) {
      filteredDiagrams = filteredDiagrams.filter(d => d.projectId === filters.projectId);
    }

    if (filters.type) {
      filteredDiagrams = filteredDiagrams.filter(d => d.type === filters.type);
    }

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredDiagrams = filteredDiagrams.filter(d =>
        d.name.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredDiagrams.sort((a, b) => {
        let aValue: any = a[filters.sortBy as keyof Diagram];
        let bValue: any = b[filters.sortBy as keyof Diagram];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (filters.sortOrder === 'desc') {
            return bValue.localeCompare(aValue);
          }
          return aValue.localeCompare(bValue);
        }

        // Default sort
        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    const response: DiagramPaginationResponse = {
      diagrams: filteredDiagrams,
      total: filteredDiagrams.length,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(filteredDiagrams.length / (filters.limit || 10))
    };

    return of(response).pipe(delay(500)); // Simulate API delay
  }

  private getMockDiagramsByProject(projectId: number, filters: DiagramSearchFilters): Observable<Diagram[]> {
    const projectDiagrams = this.mockDiagrams.filter(d => d.projectId === projectId);

    let filteredDiagrams = [...projectDiagrams];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredDiagrams = filteredDiagrams.filter(d =>
        d.name.toLowerCase().includes(query)
      );
    }

    if (filters.type) {
      filteredDiagrams = filteredDiagrams.filter(d => d.type === filters.type);
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredDiagrams.sort((a, b) => {
        let aValue: string;
        let bValue: string;

        if (filters.sortBy === 'name') {
          aValue = a.name;
          bValue = b.name;
        } else if (filters.sortBy === 'createdAt') {
          aValue = a.createdAt;
          bValue = b.createdAt;
        } else {
          aValue = a.updatedAt;
          bValue = b.updatedAt;
        }

        if (filters.sortOrder === 'desc') {
          return bValue.localeCompare(aValue);
        }
        return aValue.localeCompare(bValue);
      });
    }

    return of(filteredDiagrams).pipe(delay(300));
  }

  private getMockDiagram(id: number): Observable<Diagram> {
    const diagram = this.mockDiagrams.find(d => d.id === id);
    if (!diagram) {
      return throwError(() => new Error('Diagram not found'));
    }
    return of({ ...diagram }).pipe(delay(200));
  }

  private createMockDiagram(diagramData: CreateDiagramDto): Observable<Diagram> {
    const newId = Math.max(...this.mockDiagrams.map(d => d.id)) + 1;
    const now = new Date().toISOString();

    const newDiagram: Diagram = {
      id: newId,
      name: diagramData.name,
      type: diagramData.type,
      projectId: diagramData.idProject, // Map idProject back to projectId for internal use
      infoJson: JSON.stringify(diagramData.infoJson || {}), // Convert object to string for storage
      version: diagramData.version || 1,
      createdAt: now,
      updatedAt: now,
      showOptions: false
    };

    this.mockDiagrams.unshift(newDiagram);
    return of(newDiagram).pipe(delay(400));
  }

  private updateMockDiagram(id: number, diagramData: UpdateDiagramDto): Observable<Diagram> {
    const index = this.mockDiagrams.findIndex(d => d.id === id);
    if (index === -1) {
      return throwError(() => new Error('Diagram not found'));
    }

    const updatedDiagram = {
      ...this.mockDiagrams[index],
      ...diagramData,
      updatedAt: new Date().toISOString()
    };

    this.mockDiagrams[index] = updatedDiagram;
    return of(updatedDiagram).pipe(delay(300));
  }

  private deleteMockDiagram(id: number): Observable<void> {
    const index = this.mockDiagrams.findIndex(d => d.id === id);
    if (index === -1) {
      return throwError(() => new Error('Diagram not found'));
    }

    this.mockDiagrams.splice(index, 1);
    return of(undefined).pipe(delay(200));
  }

  private duplicateMockDiagram(id: number, newName?: string): Observable<Diagram> {
    const original = this.mockDiagrams.find(d => d.id === id);
    if (!original) {
      return throwError(() => new Error('Diagram not found'));
    }

    const newId = Math.max(...this.mockDiagrams.map(d => d.id)) + 1;
    const now = new Date().toISOString();

    const duplicated: Diagram = {
      ...original,
      id: newId,
      name: newName || `${original.name} (copy)`,
      version: original.version || 1,
      createdAt: now,
      updatedAt: now
    };

    this.mockDiagrams.unshift(duplicated);
    return of(duplicated).pipe(delay(400));
  }

  private exportMockDiagram(id: number, format: string): Observable<Blob> {
    const diagram = this.mockDiagrams.find(d => d.id === id);
    if (!diagram) {
      return throwError(() => new Error('Diagram not found'));
    }

    const content = diagram.infoJson || JSON.stringify({ message: "Empty diagram" });
    const blob = new Blob([content], { type: 'application/json' });
    return of(blob).pipe(delay(500));
  }

  private importMockDiagram(projectId: number, file: File, name?: string): Observable<Diagram> {
    const newId = Math.max(...this.mockDiagrams.map(d => d.id)) + 1;
    const now = new Date().toISOString();

    const importedDiagram: Diagram = {
      id: newId,
      name: name || `Imported ${file.name}`,
      type: DIAGRAM_TYPES.CLASS,
      projectId: projectId,
      infoJson: JSON.stringify({ message: "Imported from file" }),
      version: 1,
      createdAt: now,
      updatedAt: now,
      showOptions: false
    };

    this.mockDiagrams.unshift(importedDiagram);
    return of(importedDiagram).pipe(delay(600));
  }

  private getMockDiagramStats(projectId: number): Observable<{ total: number; byType: Record<string, number> }> {
    const projectDiagrams = this.mockDiagrams.filter(d => d.projectId === projectId);
    const byType: Record<string, number> = {};

    projectDiagrams.forEach(diagram => {
      const typeKey = diagram.type.toString();
      byType[typeKey] = (byType[typeKey] || 0) + 1;
    });

    return of({
      total: projectDiagrams.length,
      byType
    }).pipe(delay(200));
  }

  private validateMockDiagram(id: number): Observable<{ isValid: boolean; errors: string[] }> {
    const diagram = this.mockDiagrams.find(d => d.id === id);
    if (!diagram) {
      return throwError(() => new Error('Diagram not found'));
    }

    // Mock validation logic
    const isValid = Math.random() > 0.3; // 70% chance of being valid
    const errors = isValid ? [] : [
      'Missing required elements',
      'Invalid relationship between components',
      'Syntax error in diagram definition'
    ];

    return of({ isValid, errors }).pipe(delay(800));
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
