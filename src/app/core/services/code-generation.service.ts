import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodeGenerationService {
  private readonly apiUrl = 'http://localhost:3000/api/generation';

  constructor(private http: HttpClient) { }

  /**
   * Generate code for a project and return as blob
   */
  generateProjectCode(projectId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/project/${projectId}`, {
      responseType: 'blob'
    });
  }
}
