import { Component, ViewChild, type AfterViewInit, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from "@angular/router"
import { Router } from "@angular/router"
import { FlexFlowComponent } from "../../components/flex-flow/flex-flow.component"
import { DiagramType } from "@infrastructure/diagram/flex-flow.service";
import { DIAGRAM_TYPES, getDiagramTypeName } from "../../../core/models/diagram.model";

@Component({
  selector: 'app-canvas',
  imports: [CommonModule, FormsModule, FlexFlowComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements AfterViewInit, OnInit, OnDestroy {
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

  // Tipo de diagrama actual
  currentDiagramType: DiagramType = 'CLASS';

  // Añadir propiedades para los parámetros del diagrama
  projectId: number | null = null;
  diagramId: number | null = null;
  diagramTitle: string | null = null;

  // Lista de tipos de diagramas disponibles
  diagramTypes: { id: number; type: DiagramType; label: string }[] = [
    { id: DIAGRAM_TYPES.CLASS, type: "CLASS", label: getDiagramTypeName(DIAGRAM_TYPES.CLASS) },
    { id: DIAGRAM_TYPES.SEQUENCE, type: "SEQUENCE", label: getDiagramTypeName(DIAGRAM_TYPES.SEQUENCE) },
    { id: DIAGRAM_TYPES.PACKAGE, type: "PACKAGE", label: getDiagramTypeName(DIAGRAM_TYPES.PACKAGE) },
    { id: DIAGRAM_TYPES.USECASE, type: "USECASE", label: getDiagramTypeName(DIAGRAM_TYPES.USECASE) },
    { id: DIAGRAM_TYPES.COMPONENTS, type: "COMPONENTS", label: getDiagramTypeName(DIAGRAM_TYPES.COMPONENTS) },
  ]


  menuArchivoOpen = false;
  menuEditarOpen = false;
  menuTipoOpen = false;

  selectedDiagramType: DiagramType = 'CLASS';

  isModalOpen = false;

  isSidebarOpen = true;

  selectedNodeId: string | null = null;

  // Add new properties for diagram state
  isDiagramSaved: boolean = true;
  isSaving: boolean = false;
  lastSavedContent: string = '';
  autoSaveInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }


  // Métodos para el modal
  openDiagramTypeModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  ngOnInit() {
    // Leer parámetros de consulta (query parameters) en lugar de parámetros de ruta
    this.route.queryParams.subscribe(params => {
      // Obtener los parámetros del diagrama
      this.projectId = params['projectId'] ? +params['projectId'] : null;
      this.diagramId = params['diagramId'] ? +params['diagramId'] : null;
      this.diagramTitle = params['title'] as string;

      // Si tenemos un título del diagrama, usarlo como título del documento
      if (this.diagramTitle) {
        this.title = this.diagramTitle;
      }

      const type = params['type'] as number;
      const diagramType = this.diagramTypes.find(dt => dt.id == type);

      if (type && diagramType) {
        this.selectedDiagramType = diagramType.type as DiagramType;
        this.currentDiagramType = this.selectedDiagramType;
        console.log('selectedDiagramType', this.selectedDiagramType);
        console.log('currentDiagramType', this.currentDiagramType);

        // Cargar el diagrama con el tipo correcto si tenemos FlexFlowComponent disponible
        // Si no está disponible aún, se cargará en ngAfterViewInit
        console.log('flexFlowComponent', this.flexFlowComponent);
        if (this.flexFlowComponent) {
          console.log('loadDiagramWithType', this.selectedDiagramType);
          this.loadDiagramWithType(this.selectedDiagramType);
        }
      }
    });

    // También mantener la lectura de parámetros de ruta para compatibilidad
    this.route.paramMap.subscribe(params => {
      const type = params.get("type") as DiagramType;
      if (type && this.diagramTypes.some(dt => dt.type === type)) {
        this.selectedDiagramType = type;
        this.currentDiagramType = type;

        if (this.flexFlowComponent) {
          this.loadDiagramWithType(type);
        }
      }
    });

    // const userId = this.authService.getUserId();
    // console.log('ID del usuario:', userId);

    // Load diagram if diagramId is provided
    if (this.diagramId) {
      // this.loadDiagram(this.diagramId);
    }

    // Setup auto-save
    // this.setupAutoSave();
  }

  ngOnDestroy() {
    // Clear auto-save interval
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }


  ngAfterViewInit() {
    console.log("ngAfterViewInit");

    // Si tenemos un tipo de diagrama y FlexFlowComponent está disponible, cargar el diagrama
    if (this.currentDiagramType && this.flexFlowComponent) {
        this.loadDiagramWithType(this.currentDiagramType);
    }
  }

  private loadDiagramWithType(type: DiagramType): void {
    console.log('loadDiagramWithType', type);
    if (this.flexFlowComponent) {
      this.flexFlowComponent.loadDiagram(type, this.diagramId?.toString() || '');
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard/home']);
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

  addSequenceObject() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.addSequenceObject();
    }
  }

  addActivationBox() {
    if (this.flexFlowComponent) {
      this.flexFlowComponent.addActivationBox();
    }
  }

  destroySelectedObject() {
    if (this.flexFlowComponent && this.selectedNodeId) {
      this.flexFlowComponent.destroyObject(this.selectedNodeId);
    }
  }

  exportDiagram() {
    if (this.flexFlowComponent) {
      const content = this.flexFlowComponent.exportDiagram();
      const currentContent = JSON.stringify(content, null, 2);

      // Check if there are unsaved changes
      if (currentContent !== this.lastSavedContent) {
        this.isDiagramSaved = false;
        // this.saveDiagram(); // Save before export
      }

      // Create and trigger download
      const blob = new Blob([currentContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.title || 'diagram'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
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

  // Load diagram from backend
  // private async loadDiagram(diagramId: number) {
  //   try {
  //     const diagram = await this.diagramService.getDiagram(diagramId).toPromise();
  //     if (diagram) {
  //       this.title = diagram.name;
  //       this.currentDiagramType = diagram.type as DiagramType;
  //       this.lastSavedContent = diagram.content;

  //       // Load diagram content into FlexFlow
  //       if (this.flexFlowComponent) {
  //         this.flexFlowComponent.loadDiagram(this.currentDiagramType);
  //         this.flexFlowComponent.loadContent(diagram.content);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error loading diagram:', error);
  //     // Handle error (show message to user)
  //   }
  // }

  // Save diagram to backend
  // async saveDiagram() {
  //   if (!this.projectId || this.isSaving) return;

  //   this.isSaving = true;
  //   try {
  //     const content = this.flexFlowComponent.exportDiagram();

  //     const diagramData = {
  //       name: this.title,
  //       type: this.currentDiagramType,
  //       content: content,
  //       projectId: this.projectId,
  //     };

  //     if (this.diagramId) {
  //       // Update existing diagram
  //       await this.diagramService.updateDiagram(this.diagramId, diagramData).toPromise();
  //     } else {
  //       // Create new diagram
  //       // const newDiagram = await this.diagramService.createDiagram(diagramData).toPromise();
  //       this.diagramId = newDiagram.id;
  //       // Update URL with new diagram ID
  //       this.router.navigate([], {
  //         relativeTo: this.route,
  //         queryParams: { diagramId: this.diagramId },
  //         queryParamsHandling: 'merge'
  //       });
  //     }

  //     this.lastSavedContent = content;
  //     this.isDiagramSaved = true;
  //   } catch (error) {
  //     console.error('Error saving diagram:', error);
  //     // Handle error (show message to user)
  //   } finally {
  //     this.isSaving = false;
  //   }
  // }

  // Setup auto-save functionality
  // private setupAutoSave() {
  //   this.autoSaveInterval = setInterval(() => {
  //     if (!this.isDiagramSaved && !this.isSaving) {
  //       this.saveDiagram();
  //     }
  //   }, 30000); // Auto-save every 30 seconds if there are changes
  // }

  // Handle diagram content changes
  // onDiagramChanged() {
  //   if (this.flexFlowComponent) {
  //     const currentContent = this.flexFlowComponent.exportDiagram();
  //     this.isDiagramSaved = currentContent === this.lastSavedContent;
  //   }
  // }
}

