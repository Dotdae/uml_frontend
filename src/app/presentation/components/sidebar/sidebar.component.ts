import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { UserService, UserProfile } from '../../../core/services/user.service';
import { ProjectCreationComponent } from '../modals/project-creation/project-creation.component';
import { OnDevelopmentComponent } from '../modals/on-development/on-development.component';
import { ProjectsService } from '../../../core/services/projects.service';
import { ProjectEventsService } from '../../../core/services/project-events.service';
import { StatusService } from '../../../core/services/status.service';
import { Subject, takeUntil, interval } from 'rxjs';

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

export class SidebarComponent implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  showProjectModal: boolean = false;
  showDevelopmentModal: boolean = false;
  developmentFeatureName: string = '';
  isCreatingProject: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private projectsService: ProjectsService,
    private projectEventsService: ProjectEventsService,
    private statusService: StatusService
  ) { }

  ngOnInit() {
    this.loadUserProfile();

    // Refresh user profile every 30 seconds to get latest avatar
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadUserProfile();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserProfile() {
    this.userService.getUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.userProfile = profile;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
        }
      });
  }

  // Method to manually refresh user profile (can be called from other components)
  refreshUserProfile() {
    this.loadUserProfile();
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
