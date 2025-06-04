import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthRepository } from "@domain/repositories/auth/auth.repository";
import { environment } from "src/environments/environment.development";
import { BehaviorSubject, catchError, firstValueFrom, map, Observable, of, timeout } from "rxjs";
import { jwtDecode } from "jwt-decode";


@Injectable({
  providedIn: 'root'
})
export class AuthService implements AuthRepository {
  private userId: string | null = null;
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
      this.decodeAndStoreUserId();
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
        this.accessTokenSubject.next(response.token);
        this.isAuthenticatedSubject.next(true);
        localStorage.setItem('accessToken', response.token);
        this.decodeAndStoreUserId();
        console.log('Login successful, token stored:', this.accessToken);
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
        this.decodeAndStoreUserId();
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
            localStorage.setItem('accessToken', response.token);
            this.decodeAndStoreUserId();
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

  private decodeAndStoreUserId() {
    try {
      const accessToken = this.getAccessToken();
      if (accessToken) {
        const decoded: any = jwtDecode(accessToken);
        console.log('Full JWT payload:', decoded);

        // Try different possible property names for user ID
        this.userId = decoded.id || decoded.sub || decoded.userId || decoded.user_id;

        console.log('Extracted user ID:', this.userId);
        console.log('Available properties in JWT:', Object.keys(decoded));

        if (this.userId) {
          localStorage.setItem('payload', JSON.stringify(decoded));
          console.log('User ID decoded and stored:', this.userId);
        } else {
          console.error('No valid user ID found in JWT token');
          this.userId = null;
          localStorage.removeItem('payload');
        }
      } else {
        this.userId = null;
        localStorage.removeItem('payload');
        console.log('No access token available, cleared user ID');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      this.userId = null;
      localStorage.removeItem('payload');
    }
  }

  getUserId(): string | null {
    // If userId is null or we have a new token, try to decode again
    if (!this.userId || this.getAccessToken()) {
      this.decodeAndStoreUserId();
    }
    return this.userId;
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
    this.logoutLocal();
  }

  async logoutFromServer(): Promise<void> {
    console.log('Starting logout from server...');
    try {
      // Call backend logout endpoint to clear server-side cookies with timeout
      const response = await firstValueFrom(
        this.http.post(`${this.authUrl}/logout`, {}, {
          withCredentials: true,
          responseType: 'json'
        }).pipe(
          timeout(5000), // 5 second timeout
          catchError((error) => {
            console.error('Backend logout request failed:', error);
            // Don't throw error, continue with local logout
            return of({ message: 'Local logout only' });
          })
        )
      );
      console.log('Server logout response:', response);
    } catch (error) {
      console.error('Server logout failed:', error);
      // Continue with local logout even if server logout fails
    } finally {
      console.log('Performing local logout...');
      this.logoutLocal();
    }
  }

  private logoutLocal(): void {
    console.log('Logging out user...');
    this.accessToken = null;
    this.userId = null;
    this.accessTokenSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.isRefreshing = false;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('payload');
    console.log('User logged out successfully');
  }

}
