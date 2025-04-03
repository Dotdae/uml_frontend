import { Component, ViewChild, type ElementRef, type AfterViewInit, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import * as go from "gojs"
import type { DiagramType } from "@infrastructure/diagram/diagram.service"
import { DiagramService } from "@infrastructure/diagram/diagram.service"
import { ActivatedRoute } from "@angular/router"

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
  ]

  constructor(private diagramService: DiagramService, private route: ActivatedRoute) {}

  ngOnInit() {

    // Extraer el typeo de diagrama de la URL.

    this.route.paramMap.subscribe(params => {

      const type = params.get("type") as DiagramType;
      if(type && this.diagramTypes.some(dt => dt.type === type)){
        this.currentDiagramType = type;
      }
    })

  }

  ngAfterViewInit() {
    // Inicializar el diagrama
    const diagram = this.diagramService.initDiagram(
      this.diagramDiv.nativeElement as HTMLDivElement,
      this.currentDiagramType,
    )

    // Manejar selección
    diagram.addDiagramListener("ChangedSelection", (e) => {
      const node = diagram.selection.first()
      if (node instanceof go.Node) {
        this.selectedNode = node
        this.selectedLink = null
      } else if (node instanceof go.Link) {
        this.selectedLink = node
        this.selectedNode = null
      } else {
        this.selectedNode = null
        this.selectedLink = null
      }
    })
  }

  // Cambiar el tipo de diagrama
  changeDiagramType(type: DiagramType): void {
    this.currentDiagramType = type
    this.diagramService.changeDiagramType(type)
    this.title = this.diagramTypes.find((dt) => dt.type === type)?.label || "Diagrama UML"
  }

  // Métodos para la barra de herramientas
  addClass() {
    if (this.currentDiagramType === "class") {
      const newNode = {
        key: this.diagramService.getNextNodeId(),
        name: "Nueva Clase",
        properties: ["+ atributo1:tipo"],
        methods: ["+ metodo1():tipo"],
        loc: "300 300",
      }
      this.diagramService.addNode(newNode)
    }
  }

  addInterface() {
    if (this.currentDiagramType === "class") {
      const newNode = {
        key: this.diagramService.getNextNodeId(),
        name: "<<Interface>>",
        properties: ["+ atributo1:tipo"],
        methods: ["+ metodo1():tipo"],
        loc: "300 300",
      }
      this.diagramService.addNode(newNode)
    }
  }

  addActor() {
    if (this.currentDiagramType === "usecase") {
      const newNode = {
        key: this.diagramService.getNextNodeId(),
        name: "Nuevo Actor",
        category: "Actor",
        loc: "150 200",
      }
      this.diagramService.addNode(newNode)
    }
  }

  addUseCase() {
    if (this.currentDiagramType === "usecase") {
      const newNode = {
        key: this.diagramService.getNextNodeId(),
        name: "Nuevo Caso de Uso",
        category: "UseCase",
        loc: "300 200",
      }
      this.diagramService.addNode(newNode)
    }
  }

  addPackage() {
    if (this.currentDiagramType === "package") {
      const newNode = {
        key: this.diagramService.getNextNodeId(),
        name: "Nuevo Paquete",
        loc: "300 200",
      }
      this.diagramService.addNode(newNode)
    }
  }

  addComponent() {
    if (this.currentDiagramType === "component") {
      const newNode = {
        key: this.diagramService.getNextNodeId(),
        name: "Nuevo Componente",
        ports: [{ name: "Puerto 1" }],
        loc: "300 200",
      }
      this.diagramService.addNode(newNode)
    }
  }

  addObject() {
    if (this.currentDiagramType === "sequence") {
      const nextId = this.diagramService.getNextNodeId()
      // Añadir objeto
      const newNode = {
        key: nextId,
        name: "Nuevo Objeto",
        loc: `${150 + nextId * 100} 50`,
      }
      this.diagramService.addNode(newNode)

      // Añadir línea de vida
      const newLifeline = {
        key: `${nextId}_lifeline`,
        category: "LifeLine",
        loc: `${150 + nextId * 100} 70`,
      }
      this.diagramService.addNode(newLifeline)
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
    const diagram = this.diagramService.getDiagram()
    if (diagram.selection.count === 2) {
      const nodes = diagram.selection.toArray()
      if (nodes[0] instanceof go.Node && nodes[1] instanceof go.Node) {
        const newLink = {
          from: nodes[0].key,
          to: nodes[1].key,
          text: "mensaje()",
        }
        this.diagramService.addLink(newLink)
      }
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

  exportDiagram() {
    const json = this.diagramService.exportDiagram()
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(json)
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "diagrama-uml.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  importDiagram(event: any) {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        const contents = e.target.result
        this.diagramService.importDiagram(contents)
      }
      reader.readAsText(file)
    }
  }

}
