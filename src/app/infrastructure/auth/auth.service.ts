import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthRepository } from "@domain/repositories/auth/auth.repository";
import { environment } from "src/environments/environment.development";
import { BehaviorSubject, catchError, firstValueFrom, map, Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService implements AuthRepository {
  private authUrl = environment.auth_url;
  private accessToken: string | null = null;
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isRefreshing = false;

  accessToken$ = this.accessTokenSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('AuthService instance created');
    const token = this.getAccessToken();
    if (token) {
      this.isAuthenticatedSubject.next(true);
    }
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const response = await this.http.post<{ message: string }>(`${this.authUrl}/reset-password`, { email }).toPromise();
      return response?.message ? true : false;
    } catch (error) {
      console.error("request failed", error);
      return false;
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ token: string }>(`${this.authUrl}/login`, { email, password })
      );
      if (response?.token) {
        this.accessToken = response.token;
        this.accessTokenSubject.next(response.token); // Store token in BehaviorSubject
        this.isAuthenticatedSubject.next(true);
        console.log(this.accessToken)
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  }

  async loginGoogle(): Promise<void> {
    window.location.href = `${this.authUrl}/google/login?prompt=select_account`;
  }

  async handleGoogleCallback(): Promise<boolean> {
    try {
      // Extract the access token from the URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('accessToken');

      if (accessToken) {
        // Store token in both memory and localStorage
        this.accessToken = accessToken;
        this.accessTokenSubject.next(accessToken);
        this.isAuthenticatedSubject.next(true);
        localStorage.setItem('accessToken', accessToken);
        console.log('Google login successful, access token set:', accessToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Google login failed:', error);
      return false;
    }
  }

  getAccessToken(): string | null {
    // First try to get from memory
    if (this.accessToken) {
      return this.accessToken;
    }
    
    // If not in memory, try to get from localStorage
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      this.accessToken = storedToken;
      this.accessTokenSubject.next(storedToken);
      this.isAuthenticatedSubject.next(true);
      return storedToken;
    }

    return null;
  }

  refreshAccessToken(): Observable<boolean> {
    if (this.isRefreshing) {
      console.log('Token refresh already in progress');
      return of(false);
    }

    this.isRefreshing = true;
    console.log('Starting token refresh');

    return this.http
      .get<{ token: string }>(`${this.authUrl}/refresh-token`, { withCredentials: true })
      .pipe(
        map((response) => {
          if (response?.token) {
            this.accessToken = response.token;
            this.accessTokenSubject.next(response.token);
            this.isAuthenticatedSubject.next(true);
            console.log('Token refresh successful');
            return true;
          }
          this.isAuthenticatedSubject.next(false);
          return false;
        }),
        catchError((error) => {
          console.error('Token refresh failed', error);
          this.isAuthenticatedSubject.next(false);
          return of(false);
        }),
        map(result => {
          this.isRefreshing = false;
          return result;
        })
      );
  }

  async rehydrateAccessToken(): Promise<void> {
    if (this.isRefreshing) {
      console.log('Rehydration already in progress, skipping');
      return;
    }

    console.log('Attempting to rehydrate access token...');
    try {
      const success = await firstValueFrom(this.refreshAccessToken());
      if (!success) {
        console.log('Rehydration failed, logging out');
        this.logout();
      } else {
        console.log('Access token successfully rehydrated');
      }
    } catch (error) {
      console.error('Error during rehydration:', error);
      this.logout();
    }
  }

  logout(): void {
    this.accessToken = null;
    this.accessTokenSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.isRefreshing = false;
    localStorage.removeItem('accessToken'); // Clear token from localStorage
  }

}
