import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Project, CreateProjectDto, UpdateProjectDto } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private readonly apiUrl = 'http://localhost:3000/api/projects'; // Replace with your actual backend URL

  constructor(private http: HttpClient) { }

  /**
   * Get all projects
   */
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl).pipe(
      map(projects => projects.map(project => ({
        ...project,
        showOptions: false // Initialize UI state
      }))),
      catchError(this.handleError)
    );
  }

  /**
   * Get a specific project by ID
   */
  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`).pipe(
      map(project => ({
        ...project,
        showOptions: false
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Create a new project
   */
  createProject(projectData: CreateProjectDto): Observable<Project> {
    console.log('Creating project:', projectData);
    return this.http.post<Project>(this.apiUrl, projectData).pipe(
      map(project => ({
        ...project,
        showOptions: false
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing project
   */
  updateProject(id: number, projectData: UpdateProjectDto): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/${id}`, projectData).pipe(
      map(project => ({
        ...project,
        showOptions: false
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Delete a project (hard delete)
   */
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get projects by user
   */
  getProjectsByUser(userUUID: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/user/${userUUID}`).pipe(
      map(projects => projects.map(project => ({
        ...project,
        showOptions: false
      }))),
      catchError(this.handleError)
    );
  }

  /**
   * Duplicate a project
   */
  duplicateProject(id: number): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/${id}/duplicate`, {}).pipe(
      map(project => ({
        ...project,
        showOptions: false
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Update project status
   */
  updateProjectStatus(id: number, statusId: number): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/${id}/status/${statusId}`, {}).pipe(
      map(project => ({
        ...project,
        showOptions: false
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Get projects by status
   */
  getProjectsByStatus(statusId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/status/${statusId}`).pipe(
      map(projects => projects.map(project => ({
        ...project,
        showOptions: false
      }))),
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
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('ProjectsService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get the count of projects
   */
  getProjectCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`).pipe(
      catchError(this.handleError)
    );
  }
}
