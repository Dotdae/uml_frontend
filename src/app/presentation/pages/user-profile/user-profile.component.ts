import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PrimaryButtonComponent } from '../../components/buttons/primary-button/primary-button.component';
import { SecondaryButtonComponent } from '../../components/buttons/secondary-button/secondary-button.component';
import { LogoutUseCase } from '../../../application/auth/logout.usecase';

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
  error: string | null = null;
  userProfile: any = null;
  isLoggingOut = false;

  // Variables para manejar nombre separado
  names: string = '';
  lastnames: string = '';

  // Variables para manejar la carga de imagen
  isDragging = false;
  previewUrl: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private router: Router,
    private logoutUseCase: LogoutUseCase
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    // Simulación de carga de datos, reemplazar con llamada real a API
    setTimeout(() => {
      this.userProfile = {
        id: '1',
        username: 'usuario_ejemplo',
        fullName: 'Usuario Ejemplo',
        email: 'usuarioskibidiiii@ejemplo.com',
        isActive: true,
        isVerified: true,
        phone: '5551234567',
        birthdate: '1990-01-01',
        avatar: null,
        lastPasswordChange: '30/marzo/2025'
      };

      // Separar el nombre completo en nombres y apellidos
      const nameParts = this.userProfile.fullName.split(' ');
      this.names = nameParts[0] || '';
      this.lastnames = nameParts.slice(1).join(' ') || '';

      this.loading = false;
    }, 1000);
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
      alert('Tipo de archivo no válido. Por favor sube SVG, JPG o PNG.');
      return;
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. El tamaño máximo es 10MB.');
      return;
    }

    this.selectedFile = file;

    // Crear preview de la imagen
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSave(): void {
    // Combinar nombres y apellidos para el nombre completo
    this.userProfile.fullName = `${this.names} ${this.lastnames}`.trim();

    console.log('Guardando cambios del perfil:', this.userProfile);

    // Aquí iría la lógica para enviar los datos actualizados al servidor
    // Por ejemplo: this.userService.updateProfile(this.userProfile);
  }

  onCancel(): void {
    // Recargar datos originales
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
}
