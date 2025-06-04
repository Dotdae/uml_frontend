import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { ProjectCreationComponent } from '../modals/project-creation/project-creation.component';
import { OnDevelopmentComponent } from '../modals/on-development/on-development.component';
import { ProjectsService } from '../../../core/services/projects.service';
import { ProjectEventsService } from '../../../core/services/project-events.service';
import { StatusService } from '../../../core/services/status.service';

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
  isCreatingProject: boolean = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private projectsService: ProjectsService,
    private projectEventsService: ProjectEventsService,
    private statusService: StatusService
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
    if (!this.isCreatingProject) {
      this.showProjectModal = false;
    }
  }

  async handleCreateProject(projectName: string): Promise<void> {
    if (!this.userProfile) {
      console.error('No user profile available');
      return;
    }

    this.isCreatingProject = true;

    try {
      // Get default status ID (usually "Not Started")
      const statuses = await this.statusService.getAllStatuses().toPromise();
      const defaultStatus = statuses?.find(status => status.name === 'Not Started');
      const statusId = defaultStatus?.id || 1;

      console.log('Creating project:', { projectName, userUUID: this.userProfile.id, statusId });

      const project = await this.projectsService.createProject({
        userUUID: this.userProfile.id,
        projectName,
        statusId,
        generatedCounter: 0
      }).toPromise();

      if (project) {
        console.log('Project created successfully:', project);

        // Emit event to notify other components and close modal
        setTimeout(() => {
          this.projectEventsService.projectCreated(project);
          this.showProjectModal = false;
          this.isCreatingProject = false;
        }, 1400);

      }

    } catch (error) {
      console.error('Error creating project:', error);
      this.isCreatingProject = false;
      this.showProjectModal = false;
    }
  }

  openDevelopmentModal(featureName: string): void {
    this.developmentFeatureName = featureName;
    this.showDevelopmentModal = true;
  }

  closeDevelopmentModal(): void {
    this.showDevelopmentModal = false;
  }
}
