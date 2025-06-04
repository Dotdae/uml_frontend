import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Status } from '../models/project.model';

export interface CreateStatusDto {
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private readonly apiUrl = 'http://localhost:3000/api/status';

  constructor(private http: HttpClient) { }

  /**
   * Get all statuses
   */
  getAllStatuses(): Observable<Status[]> {
    return this.http.get<Status[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get a specific status by ID
   */
  getStatus(id: number): Observable<Status> {
    return this.http.get<Status>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create a new status
   */
  createStatus(statusData: CreateStatusDto): Observable<Status> {
    return this.http.post<Status>(this.apiUrl, statusData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing status
   */
  updateStatus(id: number, statusData: CreateStatusDto): Observable<Status> {
    return this.http.patch<Status>(`${this.apiUrl}/${id}`, statusData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete a status
   */
  deleteStatus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get statuses with their projects
   */
  getStatusesWithProjects(): Observable<Status[]> {
    return this.http.get<Status[]>(`${this.apiUrl}/with-projects`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Seed default statuses
   */
  seedDefaultStatuses(): Observable<Status[]> {
    return this.http.post<Status[]>(`${this.apiUrl}/seed`, {}).pipe(
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

    console.error('StatusService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
