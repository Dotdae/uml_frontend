import { Component, ViewChild, type ElementRef, type AfterViewInit, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import * as go from "gojs"
import type { DiagramType } from "@infrastructure/diagram/diagram.service"
import { DiagramService } from "@infrastructure/diagram/diagram.service"
import { ActivatedRoute } from "@angular/router"
import { HttpClient } from "@angular/common/http"
import { AuthService } from '@infrastructure/auth/auth.service';
import { Router } from "@angular/router"
import { FlexFlowComponent } from "../../components/flex-flow/flex-flow.component"

@Component({
  selector: 'app-canvas',
  imports: [CommonModule, FormsModule, FlexFlowComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements AfterViewInit, OnInit {
  @ViewChild(FlexFlowComponent) flexFlowComponent!: FlexFlowComponent;

  title = "Clase UML"
  selectedNode: any = null
  selectedLink: any = null

  // Paleta de colores
  colors = [
    { bg: "bg-white", border: "border-gray-300" },
    { bg: "bg-yellow-100", border: "border-yellow-300" },
    { bg: "bg-green-100", border: "border-green-300" },
    { bg: "bg-red-100", border: "border-red-300" },
  ]

  selectedColor = 0

  // Opciones de fuente
  fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24]
  selectedFontSize = 5 // Índice para 14pt

  // Tipo de diagrama actual
  currentDiagramType: DiagramType = "class"

  // Lista de tipos de diagramas disponibles
  diagramTypes: { type: DiagramType; label: string }[] = [
    { type: "class", label: "Diagrama de Clases" },
    { type: "sequence", label: "Diagrama de Secuencia" },
    { type: "package", label: "Diagrama de Paquetes" },
    { type: "usecase", label: "Diagrama de Casos de Uso" },
    { type: "component", label: "Diagrama de Componentes" },
    // { type: "blank", label: "Lienzo en Blanco" },
  ]

  menuArchivoOpen = false;
  menuEditarOpen = false;
  menuTipoOpen = false;

  selectedDiagramType: DiagramType = 'class';

  isModalOpen = false;

  isSidebarOpen = true;

  selectedNodeId: string | null = null;

  constructor(
    private diagramService: DiagramService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
  ) { }

  // Método para manejar el cambio de tipo de diagrama desde el menú
  onDiagramTypeChange(type: DiagramType) {
    console.log('onDiagramTypeChange called with type:', type);
    console.log('flexFlowComponent available:', !!this.flexFlowComponent);

    this.selectedDiagramType = type;
    this.currentDiagramType = type;

    // Load the new diagram type in the FlexFlow component with a small delay to ensure ViewChild is ready
    setTimeout(() => {
      if (this.flexFlowComponent) {
        // FlexFlowService doesn't support 'blank' type, so default to 'class'
        const flexFlowType = type === 'blank' ? 'class' : type;
        console.log('Calling loadDiagram with type:', flexFlowType);
        this.flexFlowComponent.loadDiagram(flexFlowType as 'class' | 'sequence' | 'package' | 'usecase' | 'component');
        console.log('loadDiagram called successfully');
      } else {
        console.log('FlexFlowComponent is still not available after timeout');
      }
    }, 100);

    // Actualiza la URL sin recargar la página
    this.router.navigate(['/canvas', type], { replaceUrl: true });
  }

  // Métodos para el modal
  openDiagramTypeModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  selectDiagramTypeAndClose(type: DiagramType): void {
    this.onDiagramTypeChange(type);
    this.closeModal();
  }

  getDiagramTypeLabel(type: DiagramType): string {
    const diagramType = this.diagramTypes.find(dt => dt.type === type);
    return diagramType ? diagramType.label : 'Tipo de diagrama';
  }

  ngOnInit() {
    // Llama al endpoint para crear el proyecto al cargar el componente
    this.createProjectOnInit();

    // Extraer el tipo de diagrama de la URL y actualizar currentDiagramType
    this.route.paramMap.subscribe(params => {
      const type = params.get("type") as DiagramType;
      if (type && this.diagramTypes.some(dt => dt.type === type)) {
        this.selectedDiagramType = type;
        this.currentDiagramType = type;
      }
    });

    // const userId = this.authService.getUserId();
    // console.log('ID del usuario:', userId);
  }

  // Lógica para crear el proyecto al cargar el componente
  createProjectOnInit() {

    const createProyectDto = {
      name: "Nuevo Proyecto", // Esto se puede hacer dinámico
      userID: this.authService.getUserId()          // Esto no sé de donde lo vamos a sacar XD
    };

    // this.http.post('http://localhost:3000/api/proyects', createProyectDto)
    //   .subscribe({
    //     next: (proyect) => {
    //       console.log('Proyecto creado:', proyect);
    //     },
    //     error: (err) => {
    //       alert('Error al crear el proyecto');
    //     }
    //   });
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit");
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  addNode() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.addNode();
    }
  }

  addPackageNode() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.addPackageNode();
    }
  }

  addInterfaceNode() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.addInterfaceNode();
    }
  }

  addActorNode() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.addActorNode();
    }
  }

  addUseCaseNode() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.addUseCaseNode();
    }
  }

  addComponentNode() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.addComponentNode();
    }
  }

  exportDiagram() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.exportDiagram();
    }
  }

  selectNode(nodeId: string) {
    this.selectedNodeId = nodeId;
  }

  changeNodeColor(colorIndex: number) {
    if (this.selectedNodeId && this.flexFlowComponent) {
      this.selectedColor = colorIndex;
      this.flexFlowComponent.changeNodeColor(this.selectedNodeId, this.colors[colorIndex]);
    }
  }

  undo() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.undo();
    }
  }

  redo() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.redo();
    }
  }

  canUndo(): boolean {
    return this.flexFlowComponent ? this.flexFlowComponent.canUndo() : false;
  }

  canRedo(): boolean {
    return this.flexFlowComponent ? this.flexFlowComponent.canRedo() : false;
  }

  zoomIn() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.zoomIn();
    }
  }

  zoomOut() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.zoomOut();
    }
  }

  resetZoom() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.resetZoom();
    }
  }

  fitToScreen() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.fitToScreen();
    }
  }

  getZoomPercentage(): number {
    return this.flexFlowComponent ? this.flexFlowComponent.getZoomPercentage() : 100;
  }
}

