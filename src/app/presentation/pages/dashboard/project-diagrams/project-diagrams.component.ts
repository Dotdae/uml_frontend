import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OptionsMenuComponent, MenuAction } from '../../../components/modals/options-menu/options-menu.component';

interface Diagram {
  id: number;
  title: string;
  type: string;
  modified: string;
  showOptions?: boolean;
}

@Component({
  selector: 'app-project-diagrams',
  standalone: true,
  imports: [
    CommonModule,
    //  RouterLink,
    OptionsMenuComponent
  ],
  templateUrl: './project-diagrams.component.html',
  styleUrl: './project-diagrams.component.css'
})
export class ProjectDiagramsComponent implements OnInit {
  projectId: number | null = null;
  diagrams: Diagram[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    // Recuperar el ID del proyecto de los parámetros de la URL
    this.route.params.subscribe(params => {
      this.projectId = +params['id']; // El '+' convierte el string a número
      this.loadProjectDiagrams(this.projectId);
    });
  }

  loadProjectDiagrams(projectId: number) {
    // Aquí normalmente harías una llamada a un servicio para obtener los diagramas
    // Por ahora, usaremos datos de ejemplo
    this.diagrams = [
      { id: 1, title: 'Diagrama de Clases - Sistema de Usuarios', type: 'clase', modified: '30/5/2025 1:32' },
      { id: 2, title: 'Diagrama de Secuencia - Login', type: 'secuencia', modified: '28/5/2025 0:16' },
      { id: 3, title: 'Diagrama de Componentes - Arquitectura', type: 'componentes', modified: '27/5/2025 15:22' },
      { id: 4, title: 'Diagrama de Paquetes - Estructura del proyecto', type: 'paquetes', modified: '25/5/2025 9:45' },
      { id: 5, title: 'Diagrama de Casos de Uso - Funcionalidades', type: 'casos_de_uso', modified: '24/5/2025 11:08' }
    ];
  }

  // openDiagram(type: string, id: number) {
  //   // Navegar al editor de diagramas con el tipo y ID específicos
  //   this.router.navigate(['/canvas'], { 
  //     queryParams: { 
  //       projectId: this.projectId,
  //       diagramId: id,
  //       type: type 
  //     } 
  //   });
  // }

  // createDiagram() {
  //   // Abrir modal para crear un nuevo diagrama o navegar a la página de creación
  //   console.log('Crear nuevo diagrama para el proyecto', this.projectId);
  //   // Implementar según tu lógica de aplicación
  // }
  // toggleOptionsMenu(event: Event, diagram: Diagram): void {
  //   event.stopPropagation();

  //   // Cerrar todos los demás menús abiertos
  //   this.diagrams.forEach(d => {
  //     if (d.id !== diagram.id) {
  //       d.showOptions = false;
  //     }
  //   });

  //   // Alternar el estado del menú actual
  //   diagram.showOptions = !diagram.showOptions;
  // }

  toggleOptionsMenu(event: Event, diagram: Diagram, buttonElement: HTMLElement): void {
    event.stopPropagation();

    // Cerrar todos los demás menús abiertos
    this.diagrams.forEach(d => {
      if (d.id !== diagram.id) {
        d.showOptions = false;
      }
    });

    // Alternar el estado del menú actual
    diagram.showOptions = !diagram.showOptions;
  }

  handleOptionSelected(action: MenuAction, diagram: Diagram): void {
    // Cerrar el menú
    diagram.showOptions = false;

    // Manejar la acción seleccionada
    switch (action) {
      case 'open':
        this.openDiagram(diagram.type, diagram.id);
        break;
      case 'rename':
        console.log('Renombrar diagrama:', diagram.id);
        // Implementar lógica para renombrar
        break;
      case 'duplicate':
        console.log('Duplicar diagrama:', diagram.id);
        // Implementar lógica para duplicar
        break;
      case 'trash':
        console.log('Mover a papelera diagrama:', diagram.id);
        // Implementar lógica para mover a la papelera
        break;
      case 'details':
        console.log('Mostrar detalles del diagrama:', diagram.id);
        // Implementar lógica para mostrar detalles
        break;
    }
  }

  openDiagram(type: string, id: number): void {
    this.router.navigate(['/canvas'], {
      queryParams: {
        projectId: this.projectId,
        diagramId: id,
        type: type
      }
    });
  }

  createDiagram(): void {
    console.log('Crear nuevo diagrama para el proyecto', this.projectId);
  }

  // Método para cerrar todos los menús cuando se hace clic fuera
  closeAllMenus(): void {
    this.diagrams.forEach(diagram => {
      diagram.showOptions = false;
    });
  }
}