import { Routes } from '@angular/router';

// Componentes Principales
import { HomePageComponent } from './presentation/pages/home-page/home-page.component';
import { AuthComponent } from './presentation/pages/auth/auth.component';
import { SignInComponent } from './presentation/pages/auth/sign-in/sign-in.component';
import { SignUpComponent } from './presentation/pages/auth/sign-up/sign-up.component';
import { RecoverPasswordComponent } from './presentation/pages/auth/recover-password/recover-password.component';
import { VerifyUserComponent } from './presentation/pages/auth/verify-user/verify-user.component';
/*
    Faltan los componentes de:
    - Dashboard
    - Lienzo de diagramas
    - Configuración de cuenta del usuario
    - Cambiar contraseña
*/

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
                path: "", component: SignInComponent
            },
            {
                path: "sign-up", component: SignUpComponent, title: "UMLForge - Registrarse"
            }
        ],
    },
    {
        path: "recover-password", component: RecoverPasswordComponent, title: "UMLForge - Recuperar contraseña"
    },
    {
        path: "verify-user", component: VerifyUserComponent, title: "UMLForge - Verificar usuario"
    }
   
    // Aquí se agregarían las rutas de las páginas faltantes

];
