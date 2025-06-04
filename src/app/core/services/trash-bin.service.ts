import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TrashBin, CreateTrashBinDto } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class TrashBinService {
  private readonly apiUrl = 'http://localhost:3000/api/trash-bin'; // Updated to include /api prefix

  constructor(private http: HttpClient) { }

  /**
   * Add item to trash bin
   */
  addToTrash(trashData: CreateTrashBinDto): Observable<TrashBin> {
    return this.http.post<TrashBin>(this.apiUrl, trashData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get all trash items
   */
  getAllTrashItems(): Observable<TrashBin[]> {
    return this.http.get<TrashBin[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get trash items by user
   */
  getTrashByUser(userId: string): Observable<TrashBin[]> {
    return this.http.get<TrashBin[]>(`${this.apiUrl}/user/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get trash items by project
   */
  getTrashByProject(projectId: number): Observable<TrashBin[]> {
    return this.http.get<TrashBin[]>(`${this.apiUrl}/project/${projectId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get trash items by diagram
   */
  getTrashByDiagram(diagramId: number): Observable<TrashBin[]> {
    return this.http.get<TrashBin[]>(`${this.apiUrl}/diagram/${diagramId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Restore item from trash
   */
  restoreFromTrash(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/restore`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Permanently delete item from trash
   */
  permanentlyDelete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Empty all trash
   */
  emptyAllTrash(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/empty/all`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Empty user's trash
   */
  emptyUserTrash(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/empty/user/${userId}`).pipe(
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

    console.error('TrashBinService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
