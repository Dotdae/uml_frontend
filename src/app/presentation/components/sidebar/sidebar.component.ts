import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { ProjectCreationComponent } from '../modals/project-creation/project-creation.component';
import { OnDevelopmentComponent } from '../modals/on-development/on-development.component';


interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  isVerified: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule, 
    RouterModule, 
    RouterLink, 
    RouterLinkActive, 
    ProjectCreationComponent,
    OnDevelopmentComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent implements OnInit {
  userProfile: UserProfile | null = null;
  showProjectModal: boolean = false;
  showDevelopmentModal: boolean = false;
  developmentFeatureName: string = '';

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

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

  openProjectModal(): void {
    this.showProjectModal = true;
  }

  closeProjectModal(): void {
    this.showProjectModal = false;
  }

  handleCreateProject(projectName: string): void {
    console.log('Creando proyecto:', projectName);
    // Aquí iría la lógica para crear el proyecto en el backend
    
    // Cerrar el modal después de crear el proyecto
    this.showProjectModal = false;
  }

  openDevelopmentModal(featureName: string): void {
    this.developmentFeatureName = featureName;
    this.showDevelopmentModal = true;
  }

  closeDevelopmentModal(): void {
    this.showDevelopmentModal = false;
  }
}
