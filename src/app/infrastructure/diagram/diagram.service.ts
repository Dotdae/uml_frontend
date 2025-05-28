import { Injectable } from '@angular/core';
import * as go from 'gojs';

export type DiagramType = "class" | "sequence" | "package" | "usecase" | "component" | "blank";


@Injectable({
  providedIn: 'root'
})
export class DiagramService {

  private diagram!: go.Diagram;
  private diagramModel!: go.GraphLinksModel;
  private currentType: DiagramType = "class";

  constructor() { }

  // Inicializa un diagrama en el tag con el id que se le pasa.
  initDiagram(div: HTMLDivElement, type: DiagramType = "class"): go.Diagram {
    this.currentType = type;
    const $ = go.GraphObject.make;

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
    });

    // Configuración del diagrama según el tipo
    switch (type) {
      case "blank":
        this.setupBlankDiagram();
        return this.diagram;
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

    // Cargar datos de ejemplo solo si el tipo no es blank
    this.loadSampleData(type);

    return this.diagram;
  }

  // Nueva función para configurar el diagrama en blanco
  private setupBlankDiagram(): void {
    const $ = go.GraphObject.make;

    // Plantilla para Clase
    const classNodeTemplate = $(go.Node, "Auto",
      $(go.Shape, "Rectangle", { fill: "#DCFCE7", stroke: "#333" }),
      $(go.TextBlock, { margin: 8 }, new go.Binding("text", "name"))
    );

    // Plantilla para Interfaz
    const interfaceNodeTemplate = $(go.Node, "Auto",
      $(go.Shape, "Rectangle", { fill: "white", stroke: "#333", strokeDashArray: [4, 2] }),
      $(go.TextBlock, { margin: 8 }, new go.Binding("text", "name"))
    );

    // Plantilla para Objeto
    const objectNodeTemplate = $(go.Node, "Auto",
      $(go.Shape, "Rectangle", { fill: "#FEF9C3", stroke: "#333" }),
      $(go.TextBlock, { margin: 8 }, new go.Binding("text", "name"))
    );

    // Plantilla para Paquete
    const packageNodeTemplate = $(go.Node, "Auto",
      $(go.Shape, "Rectangle", { fill: "#DBEAFE", stroke: "#333" }),
      $(go.TextBlock, { margin: 8 }, new go.Binding("text", "name"))
    );

    // Plantilla para Actor
    const actorNodeTemplate = $(go.Node, "Auto",
      $(go.Shape, "Circle", { fill: "#F9A8D4", stroke: "#333" }),
      $(go.TextBlock, { margin: 8 }, new go.Binding("text", "name"))
    );

    // Plantilla para Caso de Uso
    const useCaseNodeTemplate = $(go.Node, "Auto",
      $(go.Shape, "Ellipse", { fill: "#C7D2FE", stroke: "#333" }),
      $(go.TextBlock, { margin: 8 }, new go.Binding("text", "name"))
    );

    // Plantilla para Componente
    const componentNodeTemplate = $(go.Node, "Auto",
      $(go.Shape, "Rectangle", { fill: "#FDE68A", stroke: "#333" }),
      $(go.TextBlock, { margin: 8 }, new go.Binding("text", "name"))
    );

    // Mapear categorías a plantillas (corregido)
    this.diagram.nodeTemplateMap.clear();
    this.diagram.nodeTemplateMap.add("", classNodeTemplate); // Por defecto
    this.diagram.nodeTemplateMap.add("Interface", interfaceNodeTemplate);
    this.diagram.nodeTemplateMap.add("Object", objectNodeTemplate);
    this.diagram.nodeTemplateMap.add("Package", packageNodeTemplate);
    this.diagram.nodeTemplateMap.add("Actor", actorNodeTemplate);
    this.diagram.nodeTemplateMap.add("UseCase", useCaseNodeTemplate);
    this.diagram.nodeTemplateMap.add("Component", componentNodeTemplate);

    // Plantilla de enlace genérica
    this.diagram.linkTemplate =
      $(go.Link,
        $(go.Shape),
        $(go.Shape, { toArrow: "OpenTriangle" }),
        $(go.TextBlock, new go.Binding("text", "text"))
      );

    this.diagram.model = new go.GraphLinksModel([], []);
    this.diagramModel = this.diagram.model as go.GraphLinksModel;
  }

  // Obtiene el diagrama actual.
  getDiagram(): go.Diagram {
    return this.diagram;
  }

  // Obtiene el modelo del diagrama actual.
  getDiagramModel(): go.GraphLinksModel {
    return this.diagramModel;
  }

  // Cambiar el tipo de diagrama.
  changeDiagramType(type: DiagramType): void {
    if (this.currentType === type) return;

    // Limpiar el diagrama actual.
    this.diagram.model = new go.GraphLinksModel();

    // Configuración del diagrama según el tipo
    switch (type) {
      case "blank":
        this.setupBlankDiagram();
        this.currentType = type;
        return;
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
    this.currentType = type;
  }

  // Exportar el diagrama actual en formato JSON, incluyendo el tipo
  exportDiagram(): string {
    const json = JSON.parse(this.diagram.model.toJson());
    json.diagramType = this.currentType;
    return JSON.stringify(json);
  }

  // Importar un diagrama en formato JSON
  importDiagram(json: string): void {
    this.diagram.model = go.Model.fromJson(json);
    this.diagramModel = this.diagram.model as go.GraphLinksModel;
  }

  // Añadir nueva forma al diagrama.
  addNode(nodeData: any): void {
    this.diagram.startTransaction("add node");
    this.diagram.model.addNodeData(nodeData);
    this.diagram.commitTransaction("add node");
  }

  // Añadir nueva relación al diagrama.
  addLink(linkData: any): void {
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

  // Cambiar las propiedades de un nodo.
  setNodeProperty(node: go.Node, property: string, value: any): void {
    this.diagram.startTransaction("change property");
    this.diagram.model.setDataProperty(node.data, property, value);
    this.diagram.commitTransaction("change property");
  }

  // Obtener el siguiente ID para un nuevo nodo.
  getNextNodeId(): number {
    let maxId = 0;
    this.diagram.nodes.each((node) => {
      if (node.data.key > maxId) maxId = node.data.key;
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
    );

    // Plantilla para enlaces tipo "Message"
    this.diagram.linkTemplateMap.add("Message",
      $(
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
    );
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

  /**
   * Carga datos de ejemplo según el tipo de diagrama
   */
  private loadSampleData(type: DiagramType): void {

    if (this.currentType === type) return;
    
    let nodeDataArray: any[] = []
    let linkDataArray: any[] = []

    console.log(type)

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
      case "blank":
      // No cargar ningún dato para el diagrama en blanco
      nodeDataArray = [];
      linkDataArray = [];
      break;
    }

    this.diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray)
    this.diagramModel = this.diagram.model as go.GraphLinksModel
  }

  /**
   * Datos de ejemplo para diagrama de clases
   */
  private getSampleClassNodes(): any[] {
    return [
      {
        key: 1,
        name: "Persona",
        isAbstract: true,
        properties: ["- nombre: String", "- apellido: String", "- edad: int", "# direccion: String"],
        methods: ["+ getNombreCompleto(): String", "+ getEdad(): int", "+ abstract trabajar(): void"],
        loc: "150 150",
        color: "#DCFCE7", // verde claro
      },
      {
        key: 2,
        name: "Empleado",
        properties: ["- salario: double", "- departamento: String", "- fechaContratacion: Date"],
        methods: ["+ getSalario(): double", "+ calcularBonificacion(): double", "+ trabajar(): void"],
        loc: "150 350",
        color: "#FEF9C3", // amarillo claro
      },
      {
        key: 3,
        name: "Cliente",
        properties: ["- numeroCliente: String", "- fechaRegistro: Date", "- historialCompras: List<Compra>"],
        methods: ["+ getNumeroCliente(): String", "+ realizarCompra(Producto): void", "+ trabajar(): void"],
        loc: "400 350",
        color: "#FEF9C3", // amarillo claro
      },
      {
        key: 4,
        name: "Gerente",
        properties: ["- nivelAcceso: int", "- equipoTrabajo: List<Empleado>"],
        methods: [
          "+ asignarTarea(Empleado, Tarea): void",
          "+ evaluarDesempeño(Empleado): Evaluacion",
          "+ calcularBonificacion(): double",
        ],
        loc: "150 550",
        color: "#FEF9C3", // amarillo claro
      },
      {
        key: 5,
        name: "Compra",
        properties: ["- id: String", "- fecha: Date", "- monto: double", "- productos: List<Producto>"],
        methods: ["+ getId(): String", "+ getMonto(): double", "+ agregarProducto(Producto): void"],
        loc: "650 350",
        color: "#FEE2E2", // rojo claro
      },
      {
        key: 6,
        name: "Producto",
        properties: ["- codigo: String", "- nombre: String", "- precio: double", "- stock: int"],
        methods: ["+ getCodigo(): String", "+ getPrecio(): double", "+ actualizarStock(int): void"],
        loc: "650 550",
        color: "#FEE2E2", // rojo claro
      },
      {
        key: 7,
        name: "<<Interface>> Pagable",
        properties: ["+ TASA_IMPUESTO: double = 0.16"],
        methods: ["+ calcularTotal(): double", "+ aplicarImpuesto(): double"],
        loc: "400 150",
        color: "white",
      },
      {
        key: 8,
        name: "Empresa",
        properties: ["- nombre: String", "- rfc: String", "- empleados: List<Empleado>", "- clientes: List<Cliente>"],
        methods: [
          "+ contratarEmpleado(Empleado): void",
          "+ despedirEmpleado(Empleado): void",
          "+ registrarCliente(Cliente): void",
        ],
        loc: "400 550",
        color: "#DCFCE7", // verde claro
      },
    ]
  }

  /**
   * Enlaces de ejemplo para diagrama de clases
   */
  private getSampleClassLinks(): any[] {
    return [
      { from: 2, to: 1, toArrow: "OpenTriangle", dash: [10, 5], text: "herencia" },
      { from: 3, to: 1, toArrow: "OpenTriangle", dash: [10, 5], text: "herencia" },
      { from: 4, to: 2, toArrow: "OpenTriangle", dash: [10, 5], text: "herencia" },
      { from: 3, to: 5, fromArrow: "Diamond", fromText: "1", toText: "0..n", text: "realiza" },
      { from: 5, to: 6, fromArrow: "Diamond", fromText: "1", toText: "1..n", text: "contiene" },
      { from: 5, to: 7, toArrow: "OpenTriangle", dash: [10, 5], text: "implementa" },
      { from: 6, to: 7, toArrow: "OpenTriangle", dash: [10, 5], text: "implementa" },
      { from: 8, to: 2, fromArrow: "FilledDiamond", fromText: "1", toText: "0..n", text: "contiene" },
      { from: 8, to: 3, fromText: "1", toText: "0..n", text: "atiende" },
      { from: 4, to: 8, dash: [5, 5], text: "gestiona" },
    ]
  }

  /**
   * Datos de ejemplo para diagrama de secuencia
   */
  private getSampleSequenceNodes(): any[] {
    return [
      // Objetos
      { key: 1, name: "Cliente", category: "", loc: "100 50", color: "#FEF9C3" },
      { key: 2, name: "InterfazUsuario", category: "", loc: "300 50", color: "#DCFCE7" },
      { key: 3, name: "ControladorPedido", category: "", loc: "500 50", color: "#DCFCE7" },
      { key: 4, name: "ServicioValidacion", category: "", loc: "700 50", color: "#DCFCE7" },
      { key: 5, name: "BaseDatos", category: "", loc: "900 50", color: "#FEE2E2" },

      // Líneas de vida
      { key: "1_lifeline", category: "LifeLine", loc: "100 70" },
      { key: "2_lifeline", category: "LifeLine", loc: "300 70" },
      { key: "3_lifeline", category: "LifeLine", loc: "500 70" },
      { key: "4_lifeline", category: "LifeLine", loc: "700 70" },
      { key: "5_lifeline", category: "LifeLine", loc: "900 70" },

      // Activaciones
      { key: "act1", category: "Activation", loc: "100 120" },
      { key: "act2", category: "Activation", loc: "300 120" },
      { key: "act3", category: "Activation", loc: "500 150" },
      { key: "act4", category: "Activation", loc: "700 200" },
      { key: "act5", category: "Activation", loc: "900 250" },
      { key: "act6", category: "Activation", loc: "500 300" },
      { key: "act7", category: "Activation", loc: "300 350" },
      { key: "act8", category: "Activation", loc: "100 400" },
    ]
  }

  /**
   * Enlaces de ejemplo para diagrama de secuencia
   */
  private getSampleSequenceLinks(): any[] {
    return [
      // Mensajes síncronos
      {
        from: "act1",
        to: "act2",
        text: "realizarPedido(items)",
        category: "SyncMessage",
        points: [100, 120, 300, 120],
      },
      {
        from: "act2",
        to: "act3",
        text: "crearPedido(cliente, items)",
        category: "SyncMessage",
        points: [300, 150, 500, 150],
      },
      { from: "act3", to: "act4", text: "validarDatos(pedido)", category: "SyncMessage", points: [500, 200, 700, 200] },
      {
        from: "act4",
        to: "act5",
        text: "verificarInventario(items)",
        category: "SyncMessage",
        points: [700, 250, 900, 250],
      },

      // Mensajes de retorno
      {
        from: "act5",
        to: "act6",
        text: "inventarioDisponible",
        category: "ReturnMessage",
        points: [900, 300, 500, 300],
      },
      { from: "act6", to: "act7", text: "pedidoCreado", category: "ReturnMessage", points: [500, 350, 300, 350] },
      { from: "act7", to: "act8", text: "confirmacionPedido", category: "ReturnMessage", points: [300, 400, 100, 400] },

      // Mensaje asíncrono
      {
        from: "act6",
        to: "act5",
        text: "actualizarInventario()",
        category: "AsyncMessage",
        points: [500, 320, 900, 320],
      },
    ]
  }

  /**
   * Datos de ejemplo para diagrama de paquetes
   */
  private getSamplePackageNodes(): any[] {
    return [
      // Paquetes principales
      { key: 1, name: "com.empresa.app", loc: "400 100", color: "#E0F2FE" },

      // Paquetes de presentación
      { key: 2, name: "com.empresa.app.presentacion", loc: "200 200", color: "#DCFCE7" },
      { key: 3, name: "com.empresa.app.presentacion.vistas", loc: "100 300", color: "#DCFCE7" },
      { key: 4, name: "com.empresa.app.presentacion.controladores", loc: "300 300", color: "#DCFCE7" },

      // Paquetes de negocio
      { key: 5, name: "com.empresa.app.negocio", loc: "500 200", color: "#FEF9C3" },
      { key: 6, name: "com.empresa.app.negocio.servicios", loc: "400 300", color: "#FEF9C3" },
      { key: 7, name: "com.empresa.app.negocio.modelos", loc: "600 300", color: "#FEF9C3" },

      // Paquetes de datos
      { key: 8, name: "com.empresa.app.datos", loc: "800 200", color: "#FEE2E2" },
      { key: 9, name: "com.empresa.app.datos.repositorios", loc: "700 300", color: "#FEE2E2" },
      { key: 10, name: "com.empresa.app.datos.dao", loc: "900 300", color: "#FEE2E2" },

      // Paquetes de utilidades
      { key: 11, name: "com.empresa.app.util", loc: "400 400", color: "#E0F2FE" },
      { key: 12, name: "com.empresa.app.util.validacion", loc: "300 500", color: "#E0F2FE" },
      { key: 13, name: "com.empresa.app.util.seguridad", loc: "500 500", color: "#E0F2FE" },

      // Paquetes externos
      { key: 14, name: "org.framework.mvc", loc: "100 500", color: "#F5D0FE" },
      { key: 15, name: "org.framework.orm", loc: "900 500", color: "#F5D0FE" },
    ]
  }

  /**
   * Enlaces de ejemplo para diagrama de paquetes
   */
  private getSamplePackageLinks(): any[] {
    return [
      // Relaciones jerárquicas
      { from: 2, to: 1, text: "contiene" },
      { from: 5, to: 1, text: "contiene" },
      { from: 8, to: 1, text: "contiene" },
      { from: 11, to: 1, text: "contiene" },

      { from: 3, to: 2, text: "contiene" },
      { from: 4, to: 2, text: "contiene" },

      { from: 6, to: 5, text: "contiene" },
      { from: 7, to: 5, text: "contiene" },

      { from: 9, to: 8, text: "contiene" },
      { from: 10, to: 8, text: "contiene" },

      { from: 12, to: 11, text: "contiene" },
      { from: 13, to: 11, text: "contiene" },

      // Dependencias
      { from: 3, to: 4, text: "usa", dash: [5, 5] },
      { from: 4, to: 6, text: "usa", dash: [5, 5] },
      { from: 6, to: 7, text: "usa", dash: [5, 5] },
      { from: 6, to: 9, text: "usa", dash: [5, 5] },
      { from: 9, to: 10, text: "usa", dash: [5, 5] },

      // Importaciones
      { from: 3, to: 14, category: "Import" },
      { from: 10, to: 15, category: "Import" },

      // Accesos
      { from: 4, to: 12, category: "Access" },
      { from: 6, to: 13, category: "Access" },
      { from: 9, to: 12, category: "Access" },
    ]
  }

  /**
   * Datos de ejemplo para diagrama de casos de uso
   */
  private getSampleUseCaseNodes(): any[] {
    return [
      // Actores
      { key: 1, name: "Usuario", category: "Actor", loc: "100 300" },
      { key: 2, name: "Administrador", category: "Actor", loc: "100 500" },
      { key: 3, name: "Sistema de Pagos", category: "Actor", loc: "900 300" },
      { key: 4, name: "Sistema de Notificaciones", category: "Actor", loc: "900 500" },

      // Límite del sistema
      {
        key: 5,
        name: "Sistema de Gestión de Tienda Online",
        category: "Boundary",
        loc: "500 350",
        width: 600,
        height: 500,
      },

      // Casos de uso - Gestión de usuarios
      { key: 6, name: "Iniciar Sesión", category: "UseCase", loc: "300 200", color: "#DCFCE7" },
      { key: 7, name: "Registrar Usuario", category: "UseCase", loc: "300 300", color: "#DCFCE7" },
      { key: 8, name: "Recuperar Contraseña", category: "UseCase", loc: "300 400", color: "#DCFCE7" },
      { key: 9, name: "Gestionar Perfil", category: "UseCase", loc: "300 500", color: "#DCFCE7" },

      // Casos de uso - Gestión de productos
      { key: 10, name: "Buscar Productos", category: "UseCase", loc: "500 200", color: "#FEF9C3" },
      { key: 11, name: "Ver Detalles de Producto", category: "UseCase", loc: "500 300", color: "#FEF9C3" },
      { key: 12, name: "Añadir al Carrito", category: "UseCase", loc: "500 400", color: "#FEF9C3" },
      { key: 13, name: "Gestionar Inventario", category: "UseCase", loc: "500 500", color: "#FEF9C3" },

      // Casos de uso - Gestión de compras
      { key: 14, name: "Realizar Compra", category: "UseCase", loc: "700 200", color: "#FEE2E2" },
      { key: 15, name: "Procesar Pago", category: "UseCase", loc: "700 300", color: "#FEE2E2" },
      { key: 16, name: "Generar Factura", category: "UseCase", loc: "700 400", color: "#FEE2E2" },
      { key: 17, name: "Enviar Notificación", category: "UseCase", loc: "700 500", color: "#FEE2E2" },
    ]
  }

  /**
   * Enlaces de ejemplo para diagrama de casos de uso
   */
  private getSampleUseCaseLinks(): any[] {
    return [
      // Relaciones de usuario
      { from: 1, to: 6, text: "usa" },
      { from: 1, to: 7, text: "usa" },
      { from: 1, to: 8, text: "usa" },
      { from: 1, to: 9, text: "usa" },
      { from: 1, to: 10, text: "usa" },
      { from: 1, to: 11, text: "usa" },
      { from: 1, to: 12, text: "usa" },
      { from: 1, to: 14, text: "usa" },

      // Relaciones de administrador
      { from: 2, to: 6, text: "usa" },
      { from: 2, to: 9, text: "usa" },
      { from: 2, to: 13, text: "usa" },

      // Relaciones de sistemas externos
      { from: 15, to: 3, text: "usa" },
      { from: 17, to: 4, text: "usa" },

      // Relaciones de extensión
      { from: 8, to: 6, category: "Extends" },
      { from: 11, to: 10, category: "Extends" },

      // Relaciones de inclusión
      { from: 14, to: 12, category: "Includes" },
      { from: 14, to: 15, category: "Includes" },
      { from: 15, to: 16, category: "Includes" },
      { from: 16, to: 17, category: "Includes" },
    ]
  }

  /**
   * Datos de ejemplo para diagrama de componentes
   */
  private getSampleComponentNodes(): any[] {
    return [
      // Componentes de la capa de presentación
      {
        key: 1,
        name: "Interfaz de Usuario",
        ports: [{ name: "API UI" }, { name: "Eventos" }],
        loc: "200 100",
        color: "#DCFCE7",
      },
      {
        key: 2,
        name: "Controlador Web",
        ports: [{ name: "API Web" }, { name: "Servicios" }],
        loc: "200 250",
        color: "#DCFCE7",
      },
      {
        key: 3,
        name: "Gestor de Vistas",
        ports: [{ name: "Renderizado" }, { name: "Plantillas" }],
        loc: "200 400",
        color: "#DCFCE7",
      },

      // Componentes de la capa de negocio
      {
        key: 4,
        name: "Lógica de Negocio",
        ports: [{ name: "API Negocio" }, { name: "Validación" }],
        loc: "500 100",
        color: "#FEF9C3",
      },
      {
        key: 5,
        name: "Gestor de Transacciones",
        ports: [{ name: "Transacciones" }, { name: "Seguridad" }],
        loc: "500 250",
        color: "#FEF9C3",
      },
      {
        key: 6,
        name: "Servicio de Autenticación",
        ports: [{ name: "Auth" }, { name: "Usuarios" }],
        loc: "500 400",
        color: "#FEF9C3",
      },

      // Componentes de la capa de datos
      {
        key: 7,
        name: "Acceso a Datos",
        ports: [{ name: "DAO" }, { name: "Consultas" }],
        loc: "800 100",
        color: "#FEE2E2",
      },
      {
        key: 8,
        name: "Repositorio de Entidades",
        ports: [{ name: "Entidades" }, { name: "ORM" }],
        loc: "800 250",
        color: "#FEE2E2",
      },
      {
        key: 9,
        name: "Caché de Datos",
        ports: [{ name: "Cache" }, { name: "Expiración" }],
        loc: "800 400",
        color: "#FEE2E2",
      },

      // Interfaces
      { key: 10, name: "IServicioUsuario", category: "Interface", loc: "350 175", color: "#E0F2FE" },
      { key: 11, name: "IRepositorioDatos", category: "Interface", loc: "650 175", color: "#E0F2FE" },
      { key: 12, name: "IAutenticacion", category: "Interface", loc: "350 325", color: "#E0F2FE" },
      { key: 13, name: "ITransaccion", category: "Interface", loc: "650 325", color: "#E0F2FE" },

      // Artefactos
      { key: 14, name: "config.xml", category: "Artifact", loc: "350 500", color: "#F5D0FE" },
      { key: 15, name: "schema.sql", category: "Artifact", loc: "650 500", color: "#F5D0FE" },

      // Nodos
      { key: 16, name: "Servidor Web", category: "Node", loc: "200 600", color: "#D8B4FE" },
      { key: 17, name: "Servidor de Aplicaciones", category: "Node", loc: "500 600", color: "#D8B4FE" },
      { key: 18, name: "Servidor de Base de Datos", category: "Node", loc: "800 600", color: "#D8B4FE" },
    ]
  }

  /**
   * Enlaces de ejemplo para diagrama de componentes
   */
  private getSampleComponentLinks(): any[] {
    return [
      // Relaciones entre componentes
      { from: 1, to: 2, text: "usa" },
      { from: 2, to: 3, text: "usa" },
      { from: 2, to: 4, text: "usa" },
      { from: 4, to: 5, text: "usa" },
      { from: 4, to: 6, text: "usa" },
      { from: 4, to: 7, text: "usa" },
      { from: 7, to: 8, text: "usa" },
      { from: 7, to: 9, text: "usa" },

      // Implementaciones de interfaces
      { from: 2, to: 10, text: "implementa", toArrow: "OpenTriangle" },
      { from: 4, to: 10, text: "usa", dash: [5, 5] },
      { from: 6, to: 12, text: "implementa", toArrow: "OpenTriangle" },
      { from: 2, to: 12, text: "usa", dash: [5, 5] },
      { from: 5, to: 13, text: "implementa", toArrow: "OpenTriangle" },
      { from: 4, to: 13, text: "usa", dash: [5, 5] },
      { from: 8, to: 11, text: "implementa", toArrow: "OpenTriangle" },
      { from: 7, to: 11, text: "usa", dash: [5, 5] },

      // Dependencias de artefactos
      { from: 6, to: 14, category: "Dependency" },
      { from: 8, to: 15, category: "Dependency" },

      // Despliegue en nodos
      { from: 1, to: 16, text: "despliega" },
      { from: 2, to: 16, text: "despliega" },
      { from: 3, to: 16, text: "despliega" },
      { from: 4, to: 17, text: "despliega" },
      { from: 5, to: 17, text: "despliega" },
      { from: 6, to: 17, text: "despliega" },
      { from: 7, to: 17, text: "despliega" },
      { from: 8, to: 18, text: "despliega" },
      { from: 9, to: 17, text: "despliega" },
    ]
  }

}
