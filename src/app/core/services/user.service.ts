import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  isVerified: boolean;
  avatar?: string;
  phone?: string;
  birthdate?: string;
  lastPasswordChange?: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  birthdate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.auth_url}/profile`;
  private readonly updateUrl = `${environment.auth_url}/profile/update`;
  private readonly avatarUrl = `${environment.auth_url}/profile/avatar`;
  private readonly baseUrl = environment.api_url.replace('/api', ''); // Remove /api prefix for static files

  constructor(private http: HttpClient) {}

  /**
   * Get user profile information
   */
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(profile => ({
        ...profile,
        // Ensure avatar URL includes correct base URL without API prefix
        avatar: profile.avatar && !profile.avatar.startsWith('http')
          ? `${this.baseUrl}${profile.avatar}`
          : profile.avatar
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Update user profile information
   */
  updateProfile(profileData: UpdateProfileDto): Observable<UserProfile> {
    return this.http.patch<UserProfile>(this.updateUrl, profileData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Upload user avatar
   */
  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    // Don't set Content-Type header - let browser set it with boundary for FormData
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getAccessToken()}`
    });

    return this.http.post<{ avatarUrl: string }>(this.avatarUrl, formData, {
      headers
    }).pipe(
      map(response => ({
        // Ensure the avatar URL uses correct base URL without API prefix
        avatarUrl: response.avatarUrl.startsWith('http')
          ? response.avatarUrl
          : `${this.baseUrl}${response.avatarUrl}`
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Get access token from localStorage
   */
  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('User service error:', error);

    let errorMessage = 'An error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
