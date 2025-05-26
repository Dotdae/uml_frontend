import { Component, ViewChild, type ElementRef, type AfterViewInit, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import * as go from "gojs"
import type { DiagramType } from "@infrastructure/diagram/diagram.service"
import { DiagramService } from "@infrastructure/diagram/diagram.service"
import { ActivatedRoute } from "@angular/router"
import { HttpClient } from "@angular/common/http"

@Component({
  selector: 'app-canvas',
  imports: [CommonModule, FormsModule],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements AfterViewInit, OnInit {

  @ViewChild("diagramDiv") diagramDiv!: ElementRef

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
    { type: "blank", label: "Lienzo en Blanco" },
  ]

  menuArchivoOpen = false;
  menuEditarOpen = false;
  menuTipoOpen = false;

  constructor(
    private diagramService: DiagramService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Llama al endpoint para crear el proyecto al cargar el componente
    this.createProjectOnInit();

    // Extraer el tipo de diagrama de la URL y actualizar currentDiagramType
    this.route.paramMap.subscribe(params => {
      const type = params.get("type") as DiagramType;
      if (type && this.diagramTypes.some(dt => dt.type === type)) {
        this.currentDiagramType = type;
      }
    });
  }

  // Lógica para crear el proyecto al cargar el componente
  createProjectOnInit() {

    const createProyectDto = {
      name: "Nuevo Proyecto", // Esto se puede hacer dinámico
      userID: "3d22590b-5062-4a33-b627-2798ac6adb87"              // Esto no sé de donde lo vamos a sacar XD
    };

    this.http.post('http://localhost:3000/api/proyects', createProyectDto)
      .subscribe({
        next: (proyect) => {
          console.log('Proyecto creado:', proyect);
        },
        error: (err) => {
          alert('Error al crear el proyecto');
        }
      });
  }

  ngAfterViewInit() {
    // Inicializar el diagrama usando el tipo extraído de la URL
    this.route.paramMap.subscribe(params => {
      const type = params.get("type") as DiagramType;
      const diagramTypeToUse = (type && this.diagramTypes.some(dt => dt.type === type))
        ? type
        : this.currentDiagramType;

      const diagram = this.diagramService.initDiagram(
        this.diagramDiv.nativeElement as HTMLDivElement,
        diagramTypeToUse,
      );

      // Manejar selección
      diagram.addDiagramListener("ChangedSelection", (e) => {
        const node = diagram.selection.first();
        if (node instanceof go.Node) {
          this.selectedNode = node;
          this.selectedLink = null;
        } else if (node instanceof go.Link) {
          this.selectedLink = node;
          this.selectedNode = null;
        } else {
          this.selectedNode = null;
          this.selectedLink = null;
        }
      });
    });
  }

  // Cambiar el tipo de diagrama
  changeDiagramType(type: DiagramType): void {
    this.currentDiagramType = type
    this.diagramService.changeDiagramType(type)
    this.title = this.diagramTypes.find((dt) => dt.type === type)?.label || "Diagrama UML"
  }

  // Métodos para la barra de herramientas
  addClass() {
    if (this.currentDiagramType === "class" || this.currentDiagramType === "blank") {
      const key = this.diagramService.getNextNodeId();
      this.diagramService.addNode({
        key,
        name: "NuevaClase",
        properties: [],
        methods: [],
        loc: "200 200",
        color: "#DCFCE7"
      });
    }
  }

  addInterface() {
    if (
      this.currentDiagramType === "class" ||
      this.currentDiagramType === "component" ||
      this.currentDiagramType === "blank"
    ) {
      const key = this.diagramService.getNextNodeId();
      this.diagramService.addNode({
        key,
        name: "<<Interface>> NuevaInterfaz",
        properties: [],
        methods: [],
        loc: "300 200",
        color: "white"
      });
    }
  }

  addActor() {
    if (this.currentDiagramType === "usecase" || this.currentDiagramType === "blank") {
      const key = this.diagramService.getNextNodeId();
      this.diagramService.addNode({
        key,
        name: "NuevoActor",
        category: "Actor",
        loc: "100 100"
      });
    }
  }

  addUseCase() {
    if (this.currentDiagramType === "usecase" || this.currentDiagramType === "blank") {
      const key = this.diagramService.getNextNodeId();
      this.diagramService.addNode({
        key,
        name: "NuevoCasoDeUso",
        category: "UseCase",
        loc: "300 100"
      });
    }
  }

  addComponent() {
    if (this.currentDiagramType === "component" || this.currentDiagramType === "blank") {
      const key = this.diagramService.getNextNodeId();
      this.diagramService.addNode({
        key,
        name: "NuevoComponente",
        ports: [],
        loc: "200 200",
        color: "#DCFCE7"
      });
    }
  }

  addObject() {
    if (this.currentDiagramType === "sequence" || this.currentDiagramType === "blank") {
      const key = this.diagramService.getNextNodeId();
      this.diagramService.addNode({
        key,
        name: "NuevoObjeto",
        loc: "200 100",
        color: "#DCFCE7"
      });
    }
  }

  addInheritance() {
    const diagram = this.diagramService.getDiagram()
    if (diagram.selection.count === 2) {
      const nodes = diagram.selection.toArray()
      if (nodes[0] instanceof go.Node && nodes[1] instanceof go.Node) {
        const newLink = {
          from: nodes[0].key,
          to: nodes[1].key,
          toArrow: "OpenTriangle",
          dash: [10, 5],
        }
        this.diagramService.addLink(newLink)
      }
    }
  }

  addAssociation() {
    const diagram = this.diagramService.getDiagram()
    if (diagram.selection.count === 2) {
      const nodes = diagram.selection.toArray()
      if (nodes[0] instanceof go.Node && nodes[1] instanceof go.Node) {
        const newLink = {
          from: nodes[0].key,
          to: nodes[1].key,
        }
        this.diagramService.addLink(newLink)
      }
    }
  }

  addAggregation() {
    const diagram = this.diagramService.getDiagram()
    if (diagram.selection.count === 2) {
      const nodes = diagram.selection.toArray()
      if (nodes[0] instanceof go.Node && nodes[1] instanceof go.Node) {
        const newLink = {
          from: nodes[0].key,
          to: nodes[1].key,
          fromArrow: "Diamond",
          fromText: "0..n",
        }
        this.diagramService.addLink(newLink)
      }
    }
  }

  addComposition() {
    const diagram = this.diagramService.getDiagram()
    if (diagram.selection.count === 2) {
      const nodes = diagram.selection.toArray()
      if (nodes[0] instanceof go.Node && nodes[1] instanceof go.Node) {
        const newLink = {
          from: nodes[0].key,
          to: nodes[1].key,
          fromArrow: "Diamond",
          fromText: "1",
        }
        this.diagramService.addLink(newLink)
      }
    }
  }

  addDependency() {
    const diagram = this.diagramService.getDiagram()
    if (diagram.selection.count === 2) {
      const nodes = diagram.selection.toArray()
      if (nodes[0] instanceof go.Node && nodes[1] instanceof go.Node) {
        const newLink = {
          from: nodes[0].key,
          to: nodes[1].key,
          dash: [5, 5],
        }
        this.diagramService.addLink(newLink)
      }
    }
  }

  addMessage() {
    if (this.currentDiagramType === "sequence" || this.currentDiagramType === "blank") {
      const diagram = this.diagramService.getDiagram();
      if (diagram.selection.count === 2) {
        const nodes = diagram.selection.toArray();
        if (nodes[0] instanceof go.Node && nodes[1] instanceof go.Node) {
          const newLink = {
            from: nodes[0].key,
            to: nodes[1].key,
            text: "mensaje()",
            category: "Message"
          }
          this.diagramService.addLink(newLink)
        }
      }
    }
  }

  addPackage() {
    if (this.currentDiagramType === "package" || this.currentDiagramType === "blank") {
      const key = this.diagramService.getNextNodeId();
      this.diagramService.addNode({
        key,
        name: "NuevoPaquete",
        category: "Package",
        loc: "200 200",
        color: "#DBEAFE"
      });
    }
  }

  deleteSelection() {
    this.diagramService.deleteSelection()
  }

  undo() {
    this.diagramService.undo()
  }

  redo() {
    this.diagramService.redo()
  }

  setColor(index: number) {
    this.selectedColor = index
    if (this.selectedNode) {
      const color = this.getColorFromIndex(index)
      this.diagramService.setNodeProperty(this.selectedNode, "color", color)
    }
  }

  getColorFromIndex(index: number): string {
    switch (index) {
      case 0:
        return "white"
      case 1:
        return "#FEF9C3" // yellow-100
      case 2:
        return "#DCFCE7" // green-100
      case 3:
        return "#FEE2E2" // red-100
      default:
        return "white"
    }
  }

  setFontSize(index: number) {
    this.selectedFontSize = index
    // Implementar cambio de tamaño de fuente
  }

  // Exportar el diagrama (sin agregar diagramType)
  exportDiagram() {
    const json = this.diagramService.getDiagram().model.toJson();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(json);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "uml-diagram.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  // Importar el diagrama (solo carga el modelo, sin reconfigurar tipo)
  importDiagram(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        this.diagramService.importDiagram(e.target.result);
      } catch (err) {
        alert("Archivo inválido");
      }
    };
    reader.readAsText(file);
  }

  // Exportar y ENVIAR el diagrama al backend
  exportDiagramForBackend() {
    const model = this.diagramService.getDiagram().model as go.GraphLinksModel;

    // Solo las propiedades esenciales para el backend
    const nodes = model.nodeDataArray.map((node: any) => ({
      name: node.name,
      properties: Array.isArray(node.properties) ? node.properties : [],
      methods: Array.isArray(node.methods) ? node.methods : [],
      category: node.category ?? ""
    }));

    const links = model.linkDataArray.map((link: any) => ({
      from: link.from,
      to: link.to,
      type: link.type ?? "",
      text: link.text ?? "",
      category: link.category ?? ""
    }));

    const exportData = {
      diagramType: this.currentDiagramType,
      nodes,
      links
    };

    // Enviar al backend
    this.http.post('http://localhost:4200/api/generate-text', exportData)
      .subscribe({
        next: (response) => {
          // Puedes mostrar el resultado o manejarlo como desees
          console.log('Respuesta del backend:', response);
          alert('Proyecto generado correctamente.');
        },
        error: (err) => {
          alert('Error al enviar el diagrama al backend');
        }
      });
  }

}
