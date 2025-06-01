import { Routes } from '@angular/router';

// Componentes Principales
import { HomePageComponent } from './presentation/pages/home-page/home-page.component';
import { AuthComponent } from './presentation/pages/auth/auth.component';
import { SignInComponent } from './presentation/pages/auth/sign-in/sign-in.component';
import { SignUpComponent } from './presentation/pages/auth/sign-up/sign-up.component';
import { RecoverPasswordComponent } from './presentation/pages/auth/recover-password/recover-password.component';
import { VerifyUserComponent } from './presentation/pages/auth/verify-user/verify-user.component';
import { DashboardComponent } from './presentation/pages/dashboard/dashboard.component';
import { CanvasComponent } from './presentation/pages/canvas/canvas.component';
import { authGuard } from '@infrastructure/auth/guards/auth.guard';

import { ProjectsComponent } from './presentation/pages/dashboard/projects/projects.component';
import { HomeComponent } from './presentation/pages/dashboard/home/home.component';
import { ProjectDiagramsComponent } from './presentation/pages/dashboard/project-diagrams/project-diagrams.component';

import { GoogleCallbackComponent } from './presentation/components/google-callback/google-callback.component';
import { UserProfileComponent } from './presentation/pages/user-profile/user-profile.component';

// Aquí se agregarían más rutas de las páginas faltantes de la aplicación

export const routes: Routes = [

  // Página de inicio
  {
    path: "", component: HomePageComponent, title: "UMLForge - De ideas a código"
  },

  // Control de inicio de sesión, registro y verificación de correo del usuario
  {
    path: "auth", component: AuthComponent, title: "UMLForge - Inicio de sesión",
    children: [
      {
        path: "sign-in", component: SignInComponent
      },
      {
        path: "sign-up", component: SignUpComponent, title: "UMLForge - Registrarse"
      },
      {
        path: "google-callback", component: GoogleCallbackComponent
      }

    ],
  },
  {
    path: "recover-password", component: RecoverPasswordComponent, title: "UMLForge - Recuperar contraseña"
  },
  {
    path: "verify-user", component: VerifyUserComponent, title: "UMLForge - Verificar usuario"
  },

  // Aquí se agregarían las rutas de las páginas faltantes
  {
    path: "dashboard", component: DashboardComponent,
    title: "UMLForge - Panel de control",
    canActivate: [authGuard],
    children: [
      {
        path: "home", component: HomeComponent, title: "UMLForge - Inicio"
      },
      {
        path: "projects", component: ProjectsComponent, title: "UMLForge - Proyectos",
      },
      {
        path: "projects/:id/diagrams", component: ProjectDiagramsComponent, title: "UMLForge - Diagramas del proyecto",
      },
      {
        path: "user-profile", component: UserProfileComponent, title: "UMLForge - Perfil de usuario",
      }
]
  },
{
  path: "canvas/:type", component: CanvasComponent, title: "UMLForge - Lienzo de diagramas",
    canActivate: [authGuard],
  },

];
