
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthRepository } from "@domain/repositories/auth/auth.repository";
import { environment } from "src/environments/environment.development";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService implements AuthRepository {
  private authUrl = environment.auth_url
  private accessToken: string | null = null;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

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
      const response = await this.http.post<{ token: string }>(`${this.authUrl}/login`,
        { email, password }).toPromise();
      if (response?.token) {
        this.accessToken = response.token;
        this.isAuthenticatedSubject.next(true);
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

  getAccessToken(): string | null {
    return this.accessToken;
  }


}
