import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PrimaryButtonComponent } from '../../components/buttons/primary-button/primary-button.component';
import { SecondaryButtonComponent } from '../../components/buttons/secondary-button/secondary-button.component';
import { LogoutUseCase } from '../../../application/auth/logout.usecase';
import { UserService, UserProfile, UpdateProfileDto } from '../../../core/services/user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PrimaryButtonComponent,
    // SecondaryButtonComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  loading = true;
  saving = false;
  uploadingAvatar = false;
  error: string | null = null;
  successMessage: string | null = null;
  userProfile: UserProfile | null = null;
  isLoggingOut = false;

  // Variables para manejar nombre separado
  names: string = '';
  lastnames: string = '';

  // Variables para manejar datos del formulario
  phone: string = '';
  birthdate: string = '';

  // Variables para manejar la carga de imagen
  isDragging = false;
  previewUrl: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private router: Router,
    private logoutUseCase: LogoutUseCase,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.error = null;

    this.userService.getUserProfile()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.populateFormFields(profile);
          console.log('User profile loaded:', profile);
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.error = 'Error al cargar el perfil del usuario. Inténtalo de nuevo.';
        }
      });
  }

  private populateFormFields(profile: UserProfile): void {
    // Separar el nombre completo en nombres y apellidos
    const nameParts = profile.fullName.split(' ');
    this.names = nameParts[0] || '';
    this.lastnames = nameParts.slice(1).join(' ') || '';

    // Llenar otros campos
    this.phone = profile.phone || '';
    this.birthdate = profile.birthdate || '';

    // Si hay avatar, mostrarlo como preview
    if (profile.avatar) {
      this.previewUrl = profile.avatar;
    }
  }

  onDragOver(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  processFile(file: File): void {
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      this.error = 'Tipo de archivo no válido. Por favor sube SVG, JPG o PNG.';
      return;
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.error = 'El archivo es demasiado grande. El tamaño máximo es 10MB.';
      return;
    }

    this.selectedFile = file;
    this.error = null;

    // Crear preview de la imagen
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSave(): void {
    if (!this.userProfile) {
      this.error = 'No se pudo cargar el perfil del usuario.';
      return;
    }

    this.saving = true;
    this.error = null;
    this.successMessage = null;

    // Combinar nombres y apellidos para el nombre completo
    const fullName = `${this.names} ${this.lastnames}`.trim();

    const updateData: UpdateProfileDto = {
      fullName: fullName,
      phone: this.phone || undefined,
      birthdate: this.birthdate || undefined
    };

    // Primero actualizar los datos del perfil
    this.userService.updateProfile(updateData)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: (updatedProfile) => {
          this.userProfile = updatedProfile;
          this.successMessage = 'Perfil actualizado correctamente.';

          // Si hay un archivo seleccionado, subirlo después
          if (this.selectedFile) {
            this.uploadAvatar();
          }

          console.log('Profile updated successfully:', updatedProfile);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.error = 'Error al actualizar el perfil. Inténtalo de nuevo.';
        }
      });
  }

  private uploadAvatar(): void {
    if (!this.selectedFile) return;

    this.uploadingAvatar = true;

    this.userService.uploadAvatar(this.selectedFile)
      .pipe(finalize(() => this.uploadingAvatar = false))
      .subscribe({
        next: (response) => {
          if (this.userProfile) {
            this.userProfile.avatar = response.avatarUrl;
            // Update the preview to show the new avatar
            this.previewUrl = response.avatarUrl;
          }
          this.selectedFile = null;
          this.successMessage = 'Perfil y avatar actualizados correctamente.';
          console.log('Avatar uploaded successfully:', response);

          // Trigger a page reload to update sidebar instantly
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        error: (error) => {
          console.error('Error uploading avatar:', error);
          this.error = 'Error al subir el avatar. El perfil se actualizó correctamente.';
        }
      });
  }

  onCancel(): void {
    // Recargar datos originales
    this.selectedFile = null;
    this.previewUrl = null;
    this.error = null;
    this.successMessage = null;
    this.loadUserProfile();
  }

  async onLogout(): Promise<void> {
    if (this.isLoggingOut) return;

    console.log('Logout button clicked...');
    this.isLoggingOut = true;

    try {
      console.log('Executing logout use case...');
      await this.logoutUseCase.execute();
      console.log('Logout successful, redirecting to sign-in');
      this.router.navigate(['/auth/sign-in']);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to sign-in for security
      this.router.navigate(['/auth/sign-in']);
    } finally {
      console.log('Logout process completed, resetting loading state');
      this.isLoggingOut = false;
    }
  }

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }
}
