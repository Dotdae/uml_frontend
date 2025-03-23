
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthRepository } from "@domain/repositories/auth/auth.repository";
import { environment } from "src/environments/environment.development";
import { BehaviorSubject, catchError, firstValueFrom, map, Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService implements AuthRepository {
  private authUrl = environment.auth_url
  private accessToken: string | null = null;
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);


  accessToken$ = this.accessTokenSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('AuthService instance created');
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
    window.location.href = `${this.authUrl}/google/login`;
  }

  async handleGoogleCallback(): Promise<boolean> {
    try {
      // Extract the access token from the URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('accessToken');

      if (accessToken) {
        this.accessTokenSubject.next(accessToken); // Store the access token in memory
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
    console.log('Access token retrieved from memory:', this.accessToken);
    return this.accessToken;
  }

  refreshAccessToken(): Observable<boolean> {
    return this.http
      .get<{ token: string }>(`${this.authUrl}/refresh-token`, { withCredentials: true })
      .pipe(
        map((response) => {
          // console.log(response.token)
          if (response?.token) {
            this.accessToken = response.token;
            console.log('Access token refreshed:', this.accessToken);
            this.accessTokenSubject.next(response.token);
            return true;
          }
          return false;
        }),
        catchError((error) => {
          console.error('Token refresh failed', error);
          return of(false);
        })
      );
  }

  //!HACK: This function take the observable and convert it to a promise
  async rehydrateAccessToken(): Promise<void> {
    console.log('Rehydrating access token...');
    try {
      const success = await firstValueFrom(this.refreshAccessToken());
      if (!success) {
        console.log('Failed to rehydrate access token, logging out...');
        this.logout();
      } else {
        console.log('Access token successfully rehydrated.');
      }
    } catch (error) {
      console.error('Error during rehydration:', error);
      this.logout();
    }
  }

  logout(): void {
    this.accessTokenSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.accessToken = null;
  }


}
