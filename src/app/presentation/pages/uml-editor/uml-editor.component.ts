import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as go from 'gojs';

@Component({
  selector: 'app-uml-editor',
  standalone: true,
  templateUrl: './uml-editor.component.html',
  styleUrls: ['./uml-editor.component.css']
})
export class UmlEditorComponent implements AfterViewInit {
  @ViewChild('umlCanvas', { static: true }) private umlCanvasRef!: ElementRef;
  private diagram!: go.Diagram;

  ngAfterViewInit() {
    this.initDiagram();
  }

  private initDiagram(): void {
    const $ = go.GraphObject.make;

    // Initialize Diagram
    this.diagram = $(go.Diagram, this.umlCanvasRef.nativeElement, {
      "undoManager.isEnabled": true,
      "grid.visible": true
    });

    // Node Templates
    this.diagram.nodeTemplateMap.add("Class",
      $(go.Node, "Auto",
        $(go.Shape, "Rectangle", { fill: "white", stroke: "black" }),
        $(go.Panel, "Table",
          { margin: 5 },
          $(go.TextBlock, "ClassName",
            { row: 0, font: "bold 12px Arial", margin: 4 },
            new go.Binding("text", "name")
          ),
          $(go.TextBlock, "- field: type", { row: 1, margin: 2 }),
          $(go.TextBlock, "+ method(type): type", { row: 2, margin: 2 })
        )
      )
    );

    this.diagram.nodeTemplateMap.add("Association",
      $(go.Link,
        { routing: go.Link.AvoidsNodes, curve: go.Link.JumpOver },
        $(go.Shape),
        $(go.Shape, { toArrow: "Open" })
      )
    );

    this.diagram.nodeTemplateMap.add("Aggregation",
      $(go.Link,
        { routing: go.Link.AvoidsNodes, curve: go.Link.JumpOver },
        $(go.Shape),
        $(go.Shape, { toArrow: "Diamond", fill: "white" })
      )
    );

    this.diagram.nodeTemplateMap.add("Composition",
      $(go.Link,
        { routing: go.Link.AvoidsNodes, curve: go.Link.JumpOver },
        $(go.Shape),
        $(go.Shape, { toArrow: "Diamond", fill: "black" })
      )
    );

    this.diagram.nodeTemplateMap.add("Inheritance",
      $(go.Link,
        { routing: go.Link.AvoidsNodes, curve: go.Link.JumpOver },
        $(go.Shape),
        $(go.Shape, { toArrow: "Triangle" })
      )
    );

    this.diagram.nodeTemplateMap.add("Dependency",
      $(go.Link,
        { routing: go.Link.AvoidsNodes, curve: go.Link.JumpOver, strokeDashArray: [4, 2] },
        $(go.Shape),
        $(go.Shape, { toArrow: "Open" })
      )
    );

    // Set empty model
    this.diagram.model = new go.GraphLinksModel([], []);
  }

  // Add UML Elements
  addNode(type: string) {
    const newNodeData = { key: Date.now().toString(), name: type, category: type };
    this.diagram.model.addNodeData(newNodeData);
  }
}
