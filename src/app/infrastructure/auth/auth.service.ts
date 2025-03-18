
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthRepository } from "@domain/repositories/auth/auth.repository";

@Injectable({
  providedIn: 'root'
})
export class AuthService implements AuthRepository {
  private apiUrl = "http://localhost:3000/api/users";

  constructor(private http: HttpClient) { }

  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const response = await this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { email }).toPromise();
      return response?.message ? true : false;
    } catch (error) {
      console.error("request failed", error);
      return false;
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).toPromise();
      alert(response?.token)
      return response?.token ? true : false;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  }
}
