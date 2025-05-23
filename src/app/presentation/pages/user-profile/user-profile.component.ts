import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  isVerified: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  error: string | null = null;
  loading = true;
  private authSubscription?: Subscription;

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Only subscribe to auth state changes
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.loadUserProfile();
      }
    });

    // Initial load if we're already authenticated
    if (this.authService.getAccessToken()) {
      this.loadUserProfile();
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private loadUserProfile() {
    const token = this.authService.getAccessToken();
    if (!token) {
      return; // Let the auth guard handle redirection
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<UserProfile>(`${environment.api_url}/users/profile`, { headers })
      .subscribe({
        next: (profile) => {
          this.userProfile = profile;
          console.log(this.userProfile);
          this.loading = false;
        },
        error: (error) => {
          if (error.status === 401) {
            this.authService.logout();
          } else {
            this.error = 'Failed to load user profile';
            this.loading = false;
            console.error('Error loading profile:', error);
          }
        }
      });
  }
} 