import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';


interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  isVerified: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent implements OnInit{
   userProfile: UserProfile | null = null;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  private loadUserProfile() {
    const token = this.authService.getAccessToken();
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<UserProfile>(`${environment.api_url}/users/profile`, { headers })
      .subscribe({
        next: (profile) => {
          this.userProfile = profile;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
        }
      });
  }
}
