import { Routes } from '@angular/router';

// Componentes Principales
import { HomePageComponent } from './presentation/pages/home-page/home-page.component';
import { AuthComponent } from './presentation/pages/auth/auth.component';
import { SignInComponent } from './presentation/pages/auth/sign-in/sign-in.component';
import { SignUpComponent } from './presentation/pages/auth/sign-up/sign-up.component';
/*
    Faltan los componentes de:
    - Recuperar contraseña
    - Confirmar correo
    - Cambiar contraseña
*/

// Aquí se agregarían más rutas de las páginas faltantes de la aplicación

export const routes: Routes = [

    // Página de inicio
    {
        path: "", component: HomePageComponent, title: "UMLForge - De ideas a código"
    },

    // Inicio de sesión
    {
        path: "auth", component: AuthComponent, title: "UMLForge - Inicio de sesión",
        children: [
            {
                path: "", component: SignInComponent
            },
            {
                path: "sign-up", component: SignUpComponent, title: "UMLForge - Registrarse"
            }
        ]
    }

    // Aquí se agregarían las rutas de las páginas faltantes

];
