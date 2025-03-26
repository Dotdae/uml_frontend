import { Injectable } from '@angular/core';
import * as go from 'gojs';
import { from } from 'rxjs';

export type DiagramType = "class" | "sequence" | "package" | "usecase" | "component"


@Injectable({
  providedIn: 'root'
})
export class DiagramService {

  private diagram!: go.Diagram;
  private diagramModel!: go.GraphLinksModel;
  private currentType: DiagramType = "class";

  constructor() { }

  // Inicializa un dragama en el tag con el id que se le pasa.

  initDiagram(div: HTMLDivElement, type: DiagramType = "class"): go.Diagram {
    this.currentType = type
    const $ = go.GraphObject.make

    // Configuración del diagrama
    this.diagram = $(go.Diagram, div, {
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

    // Configurar plantillas según el tipo de diagrama
    switch (type) {
      case "class":
        this.setupClassDiagram()
        break
      case "sequence":
        this.setupSequenceDiagram()
        break
      case "package":
        this.setupPackageDiagram()
        break
      case "usecase":
        this.setupUseCaseDiagram()
        break
      case "component":
        this.setupComponentDiagram()
        break
    }

    // Cargar datos de ejemplo
    this.loadSampleData(type)

    return this.diagram
  }

  // Funciones para configurar las plantillas de los nodos y enlaces según el tipo de diagrama.

  // Obtiene el diagrama actual.

  getDiagram(): go.Diagram {
    return this.diagram;
  }

  // Obtiene el modelo del diagrama actual.
  getDiagramModel(): go.GraphLinksModel {
    return this.diagramModel;
  }

  // Cambiar el tipo de diagrama.

  changeDiagramType(type: DiagramType): void{

    if(this.currentType === type) return

    // Limpiar el diagrama actual.

    this.diagram.model = new go.GraphLinksModel();

    // Configurar la plantilla según el tipo de diagrama.

    switch(type){

      case "class":
        this.setupClassDiagram();
        break;

      case "sequence":
        this.setupSequenceDiagram();
        break;

      case "package":
        this.setupPackageDiagram();
        break;

      case "usecase":
        this.setupUseCaseDiagram();
        break;

      case "component":
        this.setupComponentDiagram();
        break;

    }

    // Cargar datos de ejemplo.

    this.loadSampleData(type);

  }

  // Exportar el diagrama actual en formato JSON.

  exportDiagram(): string {
    return this.diagram.model.toJson();
  }

  // Importar un diagrama en formato JSON.

  importDiagram(json: string): void {
    this.diagram.model = go.Model.fromJson(json);
    this.diagramModel = this.diagram.model as go.GraphLinksModel;
  }

  // Funciones para agregar diagramas y relaciones al diagrama actual.

  // Añadir nueva forma al diagrama.

  addNode(nodeData: any): void{
    this.diagram.startTransaction("add node");
    this.diagram.model.addNodeData(nodeData);
    this.diagram.commitTransaction("add node");
  }

  // Añadir nueva relación al diagrama.

  addLink(linkData: any): void{
    this.diagram.startTransaction("add link");
    (this.diagram.model as go.GraphLinksModel).addLinkData(linkData);
    this.diagram.commitTransaction("add link");
  }

  // Eliminar los elementos seleccionados.

  deleteSelection(): void {
    this.diagram.commandHandler.deleteSelection();
  }

  // Deshacer la última acción.

  undo(): void {
    this.diagram.commandHandler.undo();
  }

  // Rehacer la última acción.

  redo(): void {
    this.diagram.commandHandler.redo();
  }

  // Cambiar las propiedadades de un nodo.

  setNodeProperty(node: go.Node, property: string, value: any): void {
    this.diagram.startTransaction("change property");
    this.diagram.model.setDataProperty(node.data, property, value);
    this.diagram.commitTransaction("change property");
  }

  // Obtener el siguiente ID para un nuevo nodo.

  getNextNodeId(): number {

    let maxId = 0;

    this.diagram.nodes.each((node) => {
      if (node.data.key > maxId)  maxId = node.data.key;
    });

    return maxId + 1;

  }

  // Configuración de las plantillas para los diferentes tipos de diagramas.

  // Diagrama de clases.

  private setupClassDiagram(): void {
    const $ = go.GraphObject.make

    // Plantilla para clases
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

    // Plantilla para relaciones
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
  }

  // Diagrama de secuencia.

  private setupSequenceDiagram(): void {
    const $ = go.GraphObject.make

    // Plantilla para objetos (parte superior)
    this.diagram.nodeTemplate = $(
      go.Node,
      "Auto",
      {
        locationSpot: go.Spot.Top,
        fromSpot: go.Spot.Bottom,
        toSpot: go.Spot.Bottom,
        selectionAdorned: true,
        resizable: true,
        resizeObjectName: "SHAPE",
        // Añadir línea de vida automáticamente
        selectionChanged: (node) => {
          if (node.isSelected) {
            const lifeline = node.diagram?.findNodeForKey(node.data.key + "_lifeline")
            if (lifeline) lifeline.isSelected = true
          }
        },
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, "Rectangle", {
        name: "SHAPE",
        fill: "white",
        stroke: "black",
        strokeWidth: 1,
        portId: "",
        fromLinkable: true,
        toLinkable: true,
        cursor: "pointer",
        minSize: new go.Size(100, 40),
      }),
      $(
        go.TextBlock,
        {
          margin: 5,
          editable: true,
          font: "bold 12px sans-serif",
          alignment: go.Spot.Center,
        },
        new go.Binding("text", "name").makeTwoWay(),
      ),
    )

    // Plantilla para líneas de vida
    this.diagram.nodeTemplateMap.add(
      "LifeLine",
      $(
        go.Node,
        "Spot",
        {
          locationSpot: go.Spot.Top,
          selectionAdorned: false,
          isInDocumentBounds: false,
          layerName: "Background",
          // Sincronizar con el objeto padre
          selectionChanged: (node) => {
            if (node.isSelected) {
              const parent = node.diagram?.findNodeForKey(Number.parseInt(node.data.key.toString().split("_")[0]))
              if (parent) parent.isSelected = true
            }
          },
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, "LineV", {
          strokeWidth: 1,
          strokeDashArray: [3, 3],
          stroke: "gray",
          height: 500,
          alignment: go.Spot.Top,
          portId: "",
          fromLinkable: true,
          toLinkable: true,
        }),
      ),
    )

    // Plantilla para mensajes
    this.diagram.linkTemplate = $(
      go.Link,
      {
        routing: go.Link.Orthogonal,
        corner: 0,
        curviness: 0,
        adjusting: go.Link.End,
      },
      new go.Binding("points").makeTwoWay(),
      $(go.Shape, { stroke: "black", strokeWidth: 1.5 }),
      $(go.Shape, { toArrow: "OpenTriangle", stroke: "black", fill: "black" }),
      $(go.TextBlock, { segmentOffset: new go.Point(0, -10), segmentFraction: 0.5 }, new go.Binding("text", "text")),
    )
  }

  // Diagrama de paquetes.

  private setupPackageDiagram(): void {
    const $ = go.GraphObject.make

    // Plantilla para paquetes
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
        "Package",
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
        go.TextBlock,
        {
          margin: 5,
          editable: true,
          font: "bold 12px sans-serif",
          alignment: go.Spot.Center,
        },
        new go.Binding("text", "name").makeTwoWay(),
      ),
    )

    // Plantilla para relaciones
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
      $(go.TextBlock, { segmentOffset: new go.Point(0, -10), segmentFraction: 0.5 }, new go.Binding("text", "text")),
    )
  }

  // Diagrama de casos de uso.

  private setupUseCaseDiagram(): void {
    const $ = go.GraphObject.make

    // Plantilla para actores
    this.diagram.nodeTemplateMap.add(
      "Actor",
      $(
        go.Node,
        "Spot",
        {
          locationSpot: go.Spot.Center,
          fromSpot: go.Spot.AllSides,
          toSpot: go.Spot.AllSides,
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(
          go.Panel,
          "Vertical",
          $(go.Shape, "Circle", {
            width: 10,
            height: 10,
            fill: "white",
            stroke: "black",
            portId: "",
            fromLinkable: true,
            toLinkable: true,
          }),
          $(go.Shape, "LineV", {
            width: 1,
            height: 20,
            stroke: "black",
          }),
          $(go.Shape, "LineH", {
            width: 30,
            height: 1,
            stroke: "black",
          }),
          $(go.Shape, "LineV", {
            width: 1,
            height: 20,
            stroke: "black",
          }),
          $(go.Shape, "LineH", {
            width: 15,
            height: 1,
            stroke: "black",
            alignment: new go.Spot(0.5, 0, 0, 10),
          }),
          $(
            go.TextBlock,
            {
              margin: new go.Margin(5, 0, 0, 0),
              editable: true,
              font: "12px sans-serif",
            },
            new go.Binding("text", "name").makeTwoWay(),
          ),
        ),
      ),
    )

    // Plantilla para casos de uso
    this.diagram.nodeTemplateMap.add(
      "UseCase",
      $(
        go.Node,
        "Auto",
        {
          locationSpot: go.Spot.Center,
          fromSpot: go.Spot.AllSides,
          toSpot: go.Spot.AllSides,
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, "Ellipse", {
          fill: "white",
          stroke: "black",
          strokeWidth: 1,
          portId: "",
          fromLinkable: true,
          toLinkable: true,
          cursor: "pointer",
        }),
        $(
          go.TextBlock,
          {
            margin: 10,
            editable: true,
            font: "12px sans-serif",
            alignment: go.Spot.Center,
            wrap: go.TextBlock.WrapFit,
            width: 100,
          },
          new go.Binding("text", "name").makeTwoWay(),
        ),
      ),
    )

    // Plantilla para sistemas
    this.diagram.nodeTemplateMap.add(
      "System",
      $(
        go.Node,
        "Auto",
        {
          locationSpot: go.Spot.Center,
          fromSpot: go.Spot.AllSides,
          toSpot: go.Spot.AllSides,
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, "Rectangle", {
          fill: "white",
          stroke: "black",
          strokeWidth: 1,
          portId: "",
          fromLinkable: true,
          toLinkable: true,
          cursor: "pointer",
        }),
        $(
          go.TextBlock,
          {
            margin: 5,
            editable: true,
            font: "bold 12px sans-serif",
            alignment: go.Spot.Top,
          },
          new go.Binding("text", "name").makeTwoWay(),
        ),
        $(
          go.Panel,
          "Vertical",
          {
            alignment: go.Spot.TopLeft,
            margin: new go.Margin(20, 5, 5, 5),
          },
          new go.Binding("itemArray", "elements"),
          {
            itemTemplate: $(
              go.Panel,
              "Auto",
              $(go.Shape, "Ellipse", {
                fill: "white",
                stroke: "black",
                strokeWidth: 1,
                width: 100,
                height: 40,
              }),
              $(
                go.TextBlock,
                {
                  margin: 5,
                  editable: true,
                  font: "12px sans-serif",
                  alignment: go.Spot.Center,
                },
                new go.Binding("text", "name").makeTwoWay(),
              ),
            ),
          },
        ),
      ),
    )

    // Plantilla predeterminada (para nodos no especificados)
    this.diagram.nodeTemplate = $(
      go.Node,
      "Auto",
      {
        locationSpot: go.Spot.Center,
        fromSpot: go.Spot.AllSides,
        toSpot: go.Spot.AllSides,
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, "Rectangle", {
        fill: "white",
        stroke: "black",
        strokeWidth: 1,
        portId: "",
        fromLinkable: true,
        toLinkable: true,
        cursor: "pointer",
      }),
      $(
        go.TextBlock,
        {
          margin: 5,
          editable: true,
          font: "12px sans-serif",
          alignment: go.Spot.Center,
        },
        new go.Binding("text", "name").makeTwoWay(),
      ),
    )

    // Plantilla para relaciones
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
      $(
        go.Shape,
        { toArrow: "OpenTriangle", stroke: "black", fill: "white", visible: false },
        new go.Binding("visible", "toArrow", (a) => a === "OpenTriangle"),
      ),
      $(go.TextBlock, { segmentOffset: new go.Point(0, -10), segmentFraction: 0.5 }, new go.Binding("text", "text")),
    )
  }

  // Diagrama de componentes.

  private setupComponentDiagram(): void {
    const $ = go.GraphObject.make

    // Plantilla para componentes
    this.diagram.nodeTemplate = $(
      go.Node,
      "Auto",
      {
        locationSpot: go.Spot.Center,
        fromSpot: go.Spot.AllSides,
        toSpot: go.Spot.AllSides,
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, "Rectangle", {
        fill: "white",
        stroke: "black",
        strokeWidth: 1,
        portId: "",
        fromLinkable: true,
        toLinkable: true,
        cursor: "pointer",
      }),
      $(
        go.Panel,
        "Horizontal",
        { alignment: go.Spot.TopLeft, alignmentFocus: go.Spot.TopLeft },
        $(go.Shape, "Rectangle", {
          width: 15,
          height: 15,
          fill: "white",
          stroke: "black",
          margin: new go.Margin(5, 0, 0, 5),
        }),
        $(go.Shape, "Rectangle", {
          width: 15,
          height: 15,
          fill: "white",
          stroke: "black",
          margin: new go.Margin(5, 5, 0, -10),
        }),
      ),
      $(
        go.TextBlock,
        {
          margin: new go.Margin(30, 5, 5, 5),
          editable: true,
          font: "bold 12px sans-serif",
        },
        new go.Binding("text", "name").makeTwoWay(),
      ),
      $(
        go.Panel,
        "Vertical",
        {
          alignment: go.Spot.TopLeft,
          alignmentFocus: go.Spot.TopLeft,
          margin: new go.Margin(40, 5, 5, 5),
        },
        new go.Binding("itemArray", "ports"),
        {
          itemTemplate: $(
            go.Panel,
            "Horizontal",
            { margin: new go.Margin(5, 0, 0, 0) },
            $(go.Shape, "Rectangle", {
              width: 10,
              height: 10,
              fill: "white",
              stroke: "black",
            }),
            $(
              go.TextBlock,
              {
                margin: new go.Margin(0, 0, 0, 5),
                editable: true,
                font: "12px sans-serif",
              },
              new go.Binding("text", "name").makeTwoWay(),
            ),
          ),
        },
      ),
    )

    // Plantilla para interfaces
    this.diagram.nodeTemplateMap.add(
      "Interface",
      $(
        go.Node,
        "Auto",
        {
          locationSpot: go.Spot.Center,
          fromSpot: go.Spot.AllSides,
          toSpot: go.Spot.AllSides,
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Shape, "Circle", {
          fill: "white",
          stroke: "black",
          strokeWidth: 1,
          width: 30,
          height: 30,
          portId: "",
          fromLinkable: true,
          toLinkable: true,
          cursor: "pointer",
        }),
        $(
          go.TextBlock,
          {
            margin: new go.Margin(35, 0, 0, 0),
            editable: true,
            font: "12px sans-serif",
          },
          new go.Binding("text", "name").makeTwoWay(),
        ),
      ),
    )

    // Plantilla para relaciones
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
      $(
        go.Shape,
        { toArrow: "OpenTriangle", stroke: "black", fill: "white", visible: false },
        new go.Binding("visible", "toArrow", (a) => a === "OpenTriangle"),
      ),
      $(go.TextBlock, { segmentOffset: new go.Point(0, -10), segmentFraction: 0.5 }, new go.Binding("text", "text")),
    )
  }

  // Datos de ejemplo según el tipo de diagrama.

  private loadSampleData(type: DiagramType): void {
    let nodeDataArray: any[] = []
    let linkDataArray: any[] = []

    switch (type) {
      case "class":
        nodeDataArray = this.getSampleClassNodes()
        linkDataArray = this.getSampleClassLinks()
        break
      case "sequence":
        nodeDataArray = this.getSampleSequenceNodes()
        linkDataArray = this.getSampleSequenceLinks()
        break
      case "package":
        nodeDataArray = this.getSamplePackageNodes()
        linkDataArray = this.getSamplePackageLinks()
        break
      case "usecase":
        nodeDataArray = this.getSampleUseCaseNodes()
        linkDataArray = this.getSampleUseCaseLinks()
        break
      case "component":
        nodeDataArray = this.getSampleComponentNodes()
        linkDataArray = this.getSampleComponentLinks()
        break
    }

    this.diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray)
    this.diagramModel = this.diagram.model as go.GraphLinksModel
  }

  private getSampleClassNodes(): any[] {
    return [
      {
        key: 1,
        name: "Clase Abstracta",
        properties: ["+ operacion(param1:int):void", "+ operacion2(param2:String):boolean", "+ atributo1:int"],
        methods: ["+ operacion3():void"],
        loc: "150 150",
      },
      {
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
    ]
  }

  // Relaciones de ejemplo.

  private getSampleClassLinks(): any[] {
    return [
      { from: 1, to: 2, toArrow: "OpenTriangle", dash: [10, 5] },
      { from: 3, to: 2, toArrow: "OpenTriangle", dash: [10, 5] },
      { from: 3, to: 1, fromArrow: "Diamond", fromText: "1", toText: "0..n" },
    ]
  }

  // Datos de ejemplo para diagrama de secuencia

   private getSampleSequenceNodes(): any[] {
    return [
      { key: 1, name: "Cliente", category: "", loc: "100 50" },
      { key: "1_lifeline", category: "LifeLine", loc: "100 70" },
      { key: 2, name: "Sistema", category: "", loc: "300 50" },
      { key: "2_lifeline", category: "LifeLine", loc: "300 70" },
      { key: 3, name: "BaseDatos", category: "", loc: "500 50" },
      { key: "3_lifeline", category: "LifeLine", loc: "500 70" },
    ]
  }

  private getSampleSequenceLinks(): any[] {
    return [
      { from: "1_lifeline", to: "2_lifeline", text: "solicitar()", points: [100, 100, 300, 100] },
      { from: "2_lifeline", to: "3_lifeline", text: "consultar()", points: [300, 150, 500, 150] },
      { from: "3_lifeline", to: "2_lifeline", text: "resultado", points: [500, 200, 300, 200] },
      { from: "2_lifeline", to: "1_lifeline", text: "respuesta", points: [300, 250, 100, 250] },
    ]
  }

  // Datos de ejemplo para diagrama de paquetes

  private getSamplePackageNodes(): any[] {
    return [
      { key: 1, name: "Presentación", loc: "150 150" },
      { key: 2, name: "Lógica de Negocio", loc: "400 150" },
      { key: 3, name: "Acceso a Datos", loc: "400 300" },
      { key: 4, name: "Utilidades", loc: "150 300" },
    ]
  }

  private getSamplePackageLinks(): any[] {
    return [
      { from: 1, to: 2, text: "usa", dash: [5, 5] },
      { from: 2, to: 3, text: "usa", dash: [5, 5] },
      { from: 1, to: 4, text: "usa", dash: [5, 5] },
      { from: 2, to: 4, text: "usa", dash: [5, 5] },
    ]
  }

  // Datos de ejemplo para diagrama de casos de uso

  private getSampleUseCaseNodes(): any[] {
    return [
      { key: 1, name: "Usuario", category: "Actor", loc: "100 200" },
      { key: 2, name: "Administrador", category: "Actor", loc: "100 400" },
      { key: 3, name: "Iniciar Sesión", category: "UseCase", loc: "300 150" },
      { key: 4, name: "Gestionar Usuarios", category: "UseCase", loc: "300 250" },
      { key: 5, name: "Generar Reportes", category: "UseCase", loc: "300 350" },
      { key: 6, name: "Configurar Sistema", category: "UseCase", loc: "300 450" },
      {
        key: 7,
        name: "Sistema de Gestión",
        category: "System",
        loc: "500 300",
        elements: [{ name: "Validar Credenciales" }, { name: "Procesar Datos" }],
      },
    ]
  }

  private getSampleUseCaseLinks(): any[] {
    return [
      { from: 1, to: 3, text: "usa" },
      { from: 1, to: 4, text: "usa" },
      { from: 2, to: 4, text: "usa" },
      { from: 2, to: 5, text: "usa" },
      { from: 2, to: 6, text: "usa" },
      { from: 3, to: 7, text: "incluye" },
      { from: 4, to: 7, text: "incluye" },
      { from: 5, to: 7, text: "incluye" },
      { from: 6, to: 7, text: "incluye" },
    ]
  }

  // Datos de ejemplo para diagrama de componentes

  private getSampleComponentNodes(): any[] {
    return [
      {
        key: 1,
        name: "Interfaz de Usuario",
        ports: [{ name: "API UI" }, { name: "Eventos" }],
        loc: "150 150",
      },
      {
        key: 2,
        name: "Controlador",
        ports: [{ name: "API Controlador" }, { name: "Servicios" }],
        loc: "400 150",
      },
      {
        key: 3,
        name: "Modelo de Datos",
        ports: [{ name: "DAO" }, { name: "Entidades" }],
        loc: "400 300",
      },
      { key: 4, name: "IServicioAutenticación", category: "Interface", loc: "150 300" },
    ]
  }

  private getSampleComponentLinks(): any[] {
    return [
      { from: 1, to: 2, text: "usa" },
      { from: 2, to: 3, text: "usa" },
      { from: 1, to: 4, text: "implementa", toArrow: "OpenTriangle" },
      { from: 2, to: 4, text: "usa", dash: [5, 5] },
    ]
  }

}
