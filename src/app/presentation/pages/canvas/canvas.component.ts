import { Component, ViewChild, type ElementRef, type AfterViewInit, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import * as go from "gojs"

@Component({
  selector: 'app-canvas',
  imports: [CommonModule, FormsModule],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements AfterViewInit, OnInit {

  @ViewChild("diagramDiv") diagramDiv!: ElementRef

  title = "Clase UML"
  diagram!: go.Diagram
  diagramModel!: go.GraphLinksModel
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

  ngOnInit() {
    // Inicialización
  }

  ngAfterViewInit() {
    this.initDiagram()
  }

  initDiagram() {
    const $ = go.GraphObject.make

    // Crear el diagrama
    this.diagram = $(go.Diagram, this.diagramDiv.nativeElement, {
      "undoManager.isEnabled": true,
      "grid.visible": true,
      "grid.gridCellSize": new go.Size(10, 10),
      "draggingTool.dragsLink": true,
      "linkingTool.portGravity": 20,
      "relinkingTool.portGravity": 20,
      "relinkingTool.fromHandleArchetype": $(go.Shape, "Diamond", {
        segmentIndex: 0,
        cursor: "pointer",
        desiredSize: new go.Size(8, 8),
        fill: "tomato",
        stroke: "darkred",
      }),
      "relinkingTool.toHandleArchetype": $(go.Shape, "Diamond", {
        segmentIndex: -1,
        cursor: "pointer",
        desiredSize: new go.Size(8, 8),
        fill: "darkred",
        stroke: "tomato",
      }),
      "linkReshapingTool.handleArchetype": $(go.Shape, "Diamond", {
        desiredSize: new go.Size(7, 7),
        fill: "lightblue",
        stroke: "dodgerblue",
      }),
    })

    // Definir el template para las clases UML
    this.diagram.nodeTemplate = $(
      go.Node,
      "Auto",
      {
        locationSpot: go.Spot.Center,
        fromSpot: go.Spot.AllSides,
        toSpot: go.Spot.AllSides,
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(
        go.Shape,
        "Rectangle",
        {
          fill: "white",
          stroke: "black",
          strokeWidth: 1,
          portId: "",
          fromLinkable: true,
          toLinkable: true,
          cursor: "pointer",
        },
        new go.Binding("fill", "color"),
      ),
      $(
        go.Panel,
        "Table",
        { defaultRowSeparatorStroke: "black" },
        // Encabezado (nombre de la clase)
        $(
          go.TextBlock,
          {
            row: 0,
            columnSpan: 2,
            margin: 5,
            font: "bold 14px sans-serif",
            alignment: go.Spot.Center,
            editable: true,
          },
          new go.Binding("text", "name").makeTwoWay(),
        ),
        // Línea separadora
        $(go.RowColumnDefinition, { row: 1, separatorStroke: "black" }),
        // Propiedades
        $(
          go.TextBlock,
          "Propiedades",
          { row: 1, margin: 5, editable: false, alignment: go.Spot.Left },
          new go.Binding("visible", "properties", (arr) => arr && arr.length > 0),
        ),
        $(
          go.Panel,
          "Vertical",
          { row: 2, margin: 5, alignment: go.Spot.TopLeft },
          new go.Binding("itemArray", "properties"),
          {
            itemTemplate: $(
              go.Panel,
              "Auto",
              $(
                go.TextBlock,
                { margin: new go.Margin(0, 0, 0, 0), editable: true },
                new go.Binding("text", "").makeTwoWay(),
              ),
            ),
          },
        ),
        // Línea separadora
        $(go.RowColumnDefinition, { row: 3, separatorStroke: "black" }),
        // Métodos
        $(
          go.TextBlock,
          "Métodos",
          { row: 3, margin: 5, editable: false, alignment: go.Spot.Left },
          new go.Binding("visible", "methods", (arr) => arr && arr.length > 0),
        ),
        $(
          go.Panel,
          "Vertical",
          { row: 4, margin: 5, alignment: go.Spot.TopLeft },
          new go.Binding("itemArray", "methods"),
          {
            itemTemplate: $(
              go.Panel,
              "Auto",
              $(
                go.TextBlock,
                { margin: new go.Margin(0, 0, 0, 0), editable: true },
                new go.Binding("text", "").makeTwoWay(),
              ),
            ),
          },
        ),
      ),
    )

    // Definir el template para las relaciones
    this.diagram.linkTemplate = $(
      go.Link,
      {
        routing: go.Link.AvoidsNodes,
        corner: 5,
        curve: go.Link.JumpOver,
        reshapable: true,
        resegmentable: true,
        relinkableFrom: true,
        relinkableTo: true,
      },
      new go.Binding("points").makeTwoWay(),
      $(go.Shape, { stroke: "black", strokeWidth: 1.5 }, new go.Binding("strokeDashArray", "dash")),
      $(go.Shape, { toArrow: "OpenTriangle", stroke: "black", fill: "white" }, new go.Binding("toArrow", "toArrow")),
      $(
        go.Shape,
        { fromArrow: "Circle", stroke: "black", fill: "white", segmentIndex: 0, visible: false },
        new go.Binding("visible", "fromArrow", (a) => a === "Circle"),
      ),
      $(
        go.Shape,
        { fromArrow: "Diamond", stroke: "black", fill: "white", segmentIndex: 0, visible: false },
        new go.Binding("visible", "fromArrow", (a) => a === "Diamond"),
      ),
      $(
        go.TextBlock,
        { segmentOffset: new go.Point(0, -10), segmentIndex: 0, segmentFraction: 0.5 },
        new go.Binding("text", "fromText"),
      ),
      $(
        go.TextBlock,
        { segmentOffset: new go.Point(0, -10), segmentIndex: -1, segmentFraction: 0.5 },
        new go.Binding("text", "toText"),
      ),
      $(go.TextBlock, { segmentOffset: new go.Point(0, 10), segmentFraction: 0.5 }, new go.Binding("text", "text")),
    )

    // Cargar datos iniciales
    this.loadModel()

    // Manejar selección
    this.diagram.addDiagramListener("ChangedSelection", (e) => {
      const node = this.diagram.selection.first()
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

  loadModel() {
    const nodeDataArray = [
      {
        key: 1,
        name: "Clase Abstracta",
        properties: ["+ operacion(param1:int):void", "+ operacion2(param2:String):boolean", "+ atributo1:int"],
        methods: ["+ operacion3():void"],
        loc: "150 150",
      },
      {
        key: 2,
        name: "Interface",
        properties: ["+ atributo:String"],
        methods: [],
        loc: "400 150",
      },
      {
        key: 3,
        name: "Clase",
        properties: ["+ atributo:String + valor", "+ atributo2:type", "+ atributo3:type"],
        methods: ["+ operacion1():void", "+ operacion2(param):type"],
        loc: "400 300",
      },
      {
        key: 4,
        name: "Biblioteca",
        properties: [],
        methods: [],
        loc: "400 400",
      },
      {
        key: 5,
        name: "Clase",
        properties: [],
        methods: [],
        loc: "150 450",
      },
      {
        key: 6,
        name: "Interface",
        properties: [],
        methods: [],
        loc: "400 450",
      },
      {
        key: 7,
        name: "Clase Concreta",
        properties: [],
        methods: [],
        loc: "650 450",
      },
    ]

    const linkDataArray = [
      { from: 1, to: 2, toArrow: "OpenTriangle", dash: [10, 5] },
      { from: 3, to: 2, toArrow: "OpenTriangle", dash: [10, 5] },
      { from: 3, to: 4, fromArrow: "Diamond" },
      { from: 5, to: 6, dash: [5, 5] },
      { from: 6, to: 7, dash: [5, 5] },
    ]

    this.diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray)
    this.diagramModel = this.diagram.model as go.GraphLinksModel
  }

  // Métodos para la barra de herramientas
  addClass() {
    const newNode = {
      key: this.getNextKey(),
      name: "Nueva Clase",
      properties: ["+ atributo1:tipo"],
      methods: ["+ metodo1():tipo"],
      loc: "300 300",
    }

    this.diagram.startTransaction("add class")
    this.diagram.model.addNodeData(newNode)
    this.diagram.commitTransaction("add class")
  }

  addInterface() {
    const newNode = {
      key: this.getNextKey(),
      name: "<<Interface>>",
      properties: ["+ atributo1:tipo"],
      methods: ["+ metodo1():tipo"],
      loc: "300 300",
    }

    this.diagram.startTransaction("add interface")
    this.diagram.model.addNodeData(newNode)
    this.diagram.commitTransaction("add interface")
  }

  addInheritance() {
    if (this.diagram.selection.count === 2) {
      const nodes = this.diagram.selection.toArray()
      if (nodes[0] instanceof go.Node && nodes[1] instanceof go.Node) {
        const newLink = {
          from: nodes[0].key,
          to: nodes[1].key,
          toArrow: "OpenTriangle",
          dash: [10, 5],
        }

        this.diagram.startTransaction("add inheritance")
        this.diagramModel.addLinkData(newLink)
        this.diagram.commitTransaction("add inheritance")
      }
    }
  }

  addAssociation() {
    if (this.diagram.selection.count === 2) {
      const nodes = this.diagram.selection.toArray()
      if (nodes[0] instanceof go.Node && nodes[1] instanceof go.Node) {
        const newLink = {
          from: nodes[0].key,
          to: nodes[1].key,
        }

        this.diagram.startTransaction("add association")
        this.diagramModel.addLinkData(newLink)
        this.diagram.commitTransaction("add association")
      }
    }
  }

  addAggregation() {
    if (this.diagram.selection.count === 2) {
      const nodes = this.diagram.selection.toArray()
      if (nodes[0] instanceof go.Node && nodes[1] instanceof go.Node) {
        const newLink = {
          from: nodes[0].key,
          to: nodes[1].key,
          fromArrow: "Diamond",
          fromText: "0..n",
        }

        this.diagram.startTransaction("add aggregation")
        this.diagramModel.addLinkData(newLink)
        this.diagram.commitTransaction("add aggregation")
      }
    }
  }

  addComposition() {
    if (this.diagram.selection.count === 2) {
      const nodes = this.diagram.selection.toArray()
      if (nodes[0] instanceof go.Node && nodes[1] instanceof go.Node) {
        const newLink = {
          from: nodes[0].key,
          to: nodes[1].key,
          fromArrow: "Diamond",
          fromText: "1",
        }

        this.diagram.startTransaction("add composition")
        this.diagramModel.addLinkData(newLink)
        this.diagram.commitTransaction("add composition")
      }
    }
  }

  addDependency() {
    if (this.diagram.selection.count === 2) {
      const nodes = this.diagram.selection.toArray()
      if (nodes[0] instanceof go.Node && nodes[1] instanceof go.Node) {
        const newLink = {
          from: nodes[0].key,
          to: nodes[1].key,
          dash: [5, 5],
        }

        this.diagram.startTransaction("add dependency")
        this.diagramModel.addLinkData(newLink)
        this.diagram.commitTransaction("add dependency")
      }
    }
  }

  deleteSelection() {
    this.diagram.commandHandler.deleteSelection()
  }

  undo() {
    this.diagram.commandHandler.undo()
  }

  redo() {
    this.diagram.commandHandler.redo()
  }

  setColor(index: number) {
    this.selectedColor = index
    if (this.selectedNode) {
      this.diagram.startTransaction("change color")
      this.diagram.model.setDataProperty(this.selectedNode.data, "color", this.getColorFromIndex(index))
      this.diagram.commitTransaction("change color")
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

  getNextKey(): number {
    let maxKey = 0
    this.diagram.nodes.each((node) => {
      maxKey = Math.max(maxKey, node.data.key as number)
    })
    return maxKey + 1
  }

  exportDiagram() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.diagram.model.toJson()))
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
        this.diagram.model = go.Model.fromJson(contents)
      }
      reader.readAsText(file)
    }
  }


}
