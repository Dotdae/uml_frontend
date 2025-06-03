import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EFConnectionBehavior, EFMarkerType, FZoomDirective, FCreateConnectionEvent, FFlowModule, FCanvasComponent } from '@foblex/flow';
import { FormsModule } from '@angular/forms';
import { FlexFlowService, DiagramType } from '../../../infrastructure/diagram/flex-flow.service';
import { HistoryService } from '../../../infrastructure/diagram/history.service';
import { Node } from '../../../domain/models/node.model';
import { Edge } from '../../../domain/models/edge.model';

@Component({
  selector: 'app-flex-flow',
  standalone: true,
  imports: [CommonModule, FFlowModule, FormsModule, FZoomDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './flex-flow.component.html',
  styleUrls: ['./flex-flow.component.css']
})
export class FlexFlowComponent implements AfterViewInit {
  @ViewChild('canvasRef') canvasRef!: ElementRef;
  @ViewChild('fCanvas') fCanvasRef!: ElementRef;

  @Input() selectedNodeId: string | null = null;
  @Output() nodeSelected = new EventEmitter<string>();

  public connections: Edge[] = [];
  public nodes: Node[] = [];
  public eConnectionBehaviour = EFConnectionBehavior;
  public eMarkerType = EFMarkerType;
  public currentType: DiagramType = 'class';
  public diagramTypes: DiagramType[] = ['class', 'sequence', 'package', 'usecase', 'component'];


  @ViewChild(FZoomDirective, { static: true })
  protected fZoom!: FZoomDirective;
  @ViewChild(FCanvasComponent, { static: true })
  protected fCanvas!: FCanvasComponent;

  // Zoom controls
  public zoomLevel: number = 0.1;
  public minZoom: number = 0.05;
  public maxZoom: number = 2;
  public zoomStep: number = 0.1;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private flexFlowService: FlexFlowService,
    private ngZone: NgZone,
    private historyService: HistoryService
  ) {}

  onFlowLoaded() {
    this.fCanvas.resetScaleAndCenter(true);
  }
  ngAfterViewInit() {
    // Initialize the diagram after view is ready
    setTimeout(() => {
      this.loadDiagram(this.currentType);
    });
  }

  loadDiagram(type: DiagramType) {
    console.log('FlexFlow loadDiagram called with type:', type);
    console.log('Current nodes before:', this.nodes.length);
    console.log('Current connections before:', this.connections.length);

    this.currentType = type;
    const { nodes, edges } = this.flexFlowService.initDiagram(type);
    this.nodes = nodes;
    this.connections = edges;
    console.log('this.connections', this.connections);

    console.log('New nodes count:', this.nodes.length);
    console.log('New connections count:', this.connections.length);
    console.log('Current type set to:', this.currentType);

    // Force change detection
    this.changeDetectorRef.detectChanges();

    // Save initial state
    this.saveCurrentState();
  }

  /**
   * Save current state to history
   */
  private saveCurrentState(): void {
    this.historyService.saveState(this.nodes, this.connections);
  }

  /**
   * Undo the last action
   */
  undo(): void {
    const previousState = this.historyService.undo();
    if (previousState) {
      this.nodes = previousState.nodes;
      this.connections = previousState.edges;

      // Update service arrays
      this.flexFlowService.getNodes().length = 0;
      this.flexFlowService.getNodes().push(...this.nodes);
      this.flexFlowService.getEdges().length = 0;
      this.flexFlowService.getEdges().push(...this.connections);

      this.changeDetectorRef.detectChanges();
      console.log('Undo completed');
    }
  }

  /**
   * Redo the next action
   */
  redo(): void {
    const nextState = this.historyService.redo();
    if (nextState) {
      this.nodes = nextState.nodes;
      this.connections = nextState.edges;

      // Update service arrays
      this.flexFlowService.getNodes().length = 0;
      this.flexFlowService.getNodes().push(...this.nodes);
      this.flexFlowService.getEdges().length = 0;
      this.flexFlowService.getEdges().push(...this.connections);

      this.changeDetectorRef.detectChanges();
      console.log('Redo completed');
    }
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.historyService.canUndo();
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.historyService.canRedo();
  }

  /**
   * Zoom in the canvas
   */
  zoomIn(): void {
    this.fZoom.zoomIn();
    this.zoomLevel = this.fZoom.getZoomValue();
    console.log('Zoom in: from', this.zoomLevel, 'to', this.fZoom.getZoomValue());
  }

  /**
   * Zoom out the canvas
   */
  zoomOut(): void {
    this.fZoom.zoomOut();
    this.zoomLevel = this.fZoom.getZoomValue();
  }

  /**
   * Reset zoom to 100%
   */
  resetZoom(): void {
    this.fZoom.reset();
    this.zoomLevel = this.fZoom.getZoomValue();
  }

  /**
   * Fit all nodes to screen
   */
  fitToScreen(): void {
    // Set to a reasonable default zoom for fit to screen
    this.zoomLevel = 1;
    console.log('Fit to screen:', this.zoomLevel);
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Get zoom percentage for display
   */
  getZoomPercentage(): number {
    return Math.round(this.zoomLevel * 100);
  }

  /**
   * Handle keyboard shortcuts for zoom
   */
  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault();
          this.zoomIn();
          break;
        case '-':
          event.preventDefault();
          this.zoomOut();
          break;
        case '0':
          event.preventDefault();
          this.resetZoom();
          break;
        case '1':
          event.preventDefault();
          this.fitToScreen();
          break;
      }
    }
  }

  public addConnection(event: FCreateConnectionEvent): void {
    const inputId = event.fInputId;
    if (!inputId) {
      return;
    }

    let newEdge: Edge;
    const sourceId = event.fOutputId?.replace('output-', '');
    const targetId = inputId.replace('input-', '');

    console.log('Creating connection:');
    console.log('- fOutputId:', event.fOutputId);
    console.log('- fInputId:', event.fInputId);
    console.log('- sourceId:', sourceId);
    console.log('- targetId:', targetId);
    console.log('- current nodes:', this.nodes.map(n => n.id));

    switch (this.currentType) {
      case 'class':
        newEdge = this.flexFlowService.createClassRelationship(sourceId!, targetId, 'association', 'association');
        break;
      case 'sequence':
        newEdge = this.flexFlowService.createSequenceMessage(sourceId!, targetId, 'message()');
        break;
      case 'package':
        newEdge = this.flexFlowService.createPackageDependency(sourceId!, targetId);
        break;
      case 'usecase':
        newEdge = this.flexFlowService.createUseCaseAssociation(sourceId!, targetId);
        break;
      case 'component':
        newEdge = this.flexFlowService.createComponentDependency(sourceId!, targetId);
        break;
      default:
        return;
    }

    console.log('Created edge:', newEdge);

    // Add the new edge to the component's connections array
    this.connections = [...this.connections, newEdge];
    // Also add to service for consistency
    this.flexFlowService.addEdge(newEdge);

    console.log('Updated connections:', this.connections);

    // Force change detection
    this.changeDetectorRef.detectChanges();

    // Save state after modification
    this.saveCurrentState();
  }

  addNode() {
    // Generate a simple unique ID
    const newId = `${this.nodes.length + 10}`; // Start from 10 to avoid conflicts with existing IDs
    const position = { x: 200 + this.nodes.length * 40, y: 200 + this.nodes.length * 40 };
    let newNode: Node;

    switch (this.currentType) {
      case 'class':
        newNode = this.flexFlowService.createClassNode(newId, 'NewClass', position);
        break;
      case 'sequence':
        newNode = this.flexFlowService.createActorNode(newId, 'NewActor', position);
        break;
      case 'package':
        newNode = this.flexFlowService.createPackageNode(newId, 'NewPackage', position);
        break;
      case 'usecase':
        newNode = this.flexFlowService.createUseCaseNode(newId, 'NewUseCase', position);
        break;
      case 'component':
        newNode = this.flexFlowService.createComponentNode(newId, 'NewComponent', position);
        break;
      default:
        return;
    }

    console.log('newNode', newNode);
    console.log('this.nodes', this.nodes);

    // Add to both component array and service array for consistency
    this.nodes = [...this.nodes, newNode];
    this.flexFlowService.addNode(newNode);

    // Save state after modification
    this.saveCurrentState();
  }

  addInterfaceNode() {
    // Generate a simple unique ID
    const newId = `${this.nodes.length + 10}`;
    const position = { x: 200 + this.nodes.length * 40, y: 200 + this.nodes.length * 40 };
    const newNode = this.flexFlowService.createInterfaceNode(newId, 'NewInterface', position);

    console.log('newInterfaceNode', newNode);

    // Add to both component array and service array for consistency
    this.nodes = [...this.nodes, newNode];
    this.flexFlowService.addNode(newNode);

    // Save state after modification
    this.saveCurrentState();
  }

  addPackageNode() {
    // Generate a simple unique ID
    const newId = `${this.nodes.length + 10}`;
    const position = { x: 200 + this.nodes.length * 40, y: 200 + this.nodes.length * 40 };
    const newNode = this.flexFlowService.createPackageNode(newId, 'NewPackage', position);

    console.log('newPackageNode', newNode);

    // Add to both component array and service array for consistency
    this.nodes = [...this.nodes, newNode];
    this.flexFlowService.addNode(newNode);

    // Save state after modification
    this.saveCurrentState();
  }

  addActorNode() {
    // Generate a simple unique ID
    const newId = `${this.nodes.length + 10}`;
    const position = { x: 200 + this.nodes.length * 40, y: 200 + this.nodes.length * 40 };
    const newNode = this.flexFlowService.createActorNode(newId, 'NewActor', position);

    console.log('newActorNode', newNode);

    // Add to both component array and service array for consistency
    this.nodes = [...this.nodes, newNode];
    this.flexFlowService.addNode(newNode);

    // Save state after modification
    this.saveCurrentState();
  }

  addUseCaseNode() {
    // Generate a simple unique ID
    const newId = `${this.nodes.length + 10}`;
    const position = { x: 200 + this.nodes.length * 40, y: 200 + this.nodes.length * 40 };
    const newNode = this.flexFlowService.createUseCaseNode(newId, 'NewUseCase', position);

    console.log('newUseCaseNode', newNode);

    // Add to both component array and service array for consistency
    this.nodes = [...this.nodes, newNode];
    this.flexFlowService.addNode(newNode);

    // Save state after modification
    this.saveCurrentState();
  }

  addComponentNode() {
    // Generate a simple unique ID
    const newId = `${this.nodes.length + 10}`;
    const position = { x: 200 + this.nodes.length * 40, y: 200 + this.nodes.length * 40 };
    const newNode = this.flexFlowService.createComponentNode(newId, 'NewComponent', position);

    console.log('newComponentNode', newNode);

    // Add to both component array and service array for consistency
    this.nodes = [...this.nodes, newNode];
    this.flexFlowService.addNode(newNode);

    // Save state after modification
    this.saveCurrentState();
  }

  deleteNode(nodeId: string) {
    this.nodes = this.nodes.filter(node => node.id !== nodeId);
    this.connections = this.connections.filter(
      conn => conn.source !== nodeId && conn.target !== nodeId
    );

    // Save state after modification
    this.saveCurrentState();
  }

  removeConnection(connectionId: string) {
    this.connections = this.connections.filter(conn => conn.id !== connectionId);

    // Save state after modification
    this.saveCurrentState();
  }

  exportDiagram() {
    const diagram = {
      type: this.currentType,
      nodes: this.nodes,
      connections: this.connections
    };

    const jsonString = JSON.stringify(diagram, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.currentType}-diagram.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  importDiagram(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const diagram = JSON.parse(content);
        this.currentType = diagram.type;
        this.nodes = diagram.nodes;
        this.connections = diagram.connections;
      };
      reader.readAsText(input.files[0]);
    }
  }

  trackByNodeId(index: number, node: Node): string {
    return node.id;
  }

  trackByConnectionId(index: number, connection: Edge): string {
    return connection.id;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  updateNodeLabel(nodeId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newLabel = input.value.trim();

    if (newLabel) {
      // Update the node in the component array
      const node = this.nodes.find(n => n.id === nodeId);
      if (node) {
        node.data.label = newLabel;
        // Also update in the service for consistency
        this.flexFlowService.updateNodeData(nodeId, { label: newLabel });
      }
    }
  }

  addProperty(nodeId: string): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      if (!node.data.properties) {
        node.data.properties = [];
      }
      node.data.properties.push('- newProperty: type');
      // Update in service as well
      this.flexFlowService.updateNodeData(nodeId, { properties: node.data.properties });

      // Save state after modification
      this.saveCurrentState();
    }
  }

  updateNodeProperty(nodeId: string, index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newProperty = input.value.trim();

    const node = this.nodes.find(n => n.id === nodeId);
    if (node && node.data.properties && newProperty) {
      node.data.properties[index] = newProperty;
      // Update in service as well
      this.flexFlowService.updateNodeData(nodeId, { properties: node.data.properties });
    }
  }

  updatePropertyValue(nodeId: string, index: number, value: string): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node && node.data.properties) {
      node.data.properties[index] = value;
      // Update in service as well
      this.flexFlowService.updateNodeData(nodeId, { properties: node.data.properties });
    }
  }

  removeProperty(nodeId: string, index: number): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node && node.data.properties) {
      node.data.properties.splice(index, 1);
      // Update in service as well
      this.flexFlowService.updateNodeData(nodeId, { properties: node.data.properties });

      // Save state after modification
      this.saveCurrentState();
    }
  }

  addMethod(nodeId: string): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      if (!node.data.methods) {
        node.data.methods = [];
      }
      node.data.methods.push('+ newMethod()');
      // Update in service as well
      this.flexFlowService.updateNodeData(nodeId, { methods: node.data.methods });

      // Save state after modification
      this.saveCurrentState();
    }
  }

  updateNodeMethod(nodeId: string, index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newMethod = input.value.trim();

    const node = this.nodes.find(n => n.id === nodeId);
    if (node && node.data.methods && newMethod) {
      node.data.methods[index] = newMethod;
      // Update in service as well
      this.flexFlowService.updateNodeData(nodeId, { methods: node.data.methods });
    }
  }

  updateMethodValue(nodeId: string, index: number, value: string): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node && node.data.methods) {
      node.data.methods[index] = value;
      // Update in service as well
      this.flexFlowService.updateNodeData(nodeId, { methods: node.data.methods });
    }
  }

  removeMethod(nodeId: string, index: number): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node && node.data.methods) {
      node.data.methods.splice(index, 1);
      // Update in service as well
      this.flexFlowService.updateNodeData(nodeId, { methods: node.data.methods });

      // Save state after modification
      this.saveCurrentState();
    }
  }

  selectNode(nodeId: string): void {
    this.nodeSelected.emit(nodeId);
  }

  changeNodeColor(nodeId: string, color: any): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      // Add color information to node data
      node.data.color = color;
      // Update in service as well
      this.flexFlowService.updateNodeData(nodeId, { color: color });
      // Force change detection
      this.changeDetectorRef.detectChanges();

      // Save state after modification
      this.saveCurrentState();
    }
  }

  getNodeBackgroundColor(node: Node): string {
    if (!node.data.color) return '#ffffff';

    const colorMap: { [key: string]: string } = {
      'bg-white': '#ffffff',
      'bg-yellow-100': '#fef3c7',
      'bg-green-100': '#dcfce7',
      'bg-red-100': '#fdc4c6',
    };

    return colorMap[node.data.color.bg] || '#ffffff';
  }

  getNodeBorderColor(node: Node): string {
    if (!node.data.color) return '#d1d5db';

    const borderColorMap: { [key: string]: string } = {
      'border-gray-300': '#d1d5db',
      'border-yellow-300': '#fde047',
      'border-green-300': '#86efac',
      'border-red-300': '#fca5a5'
    };

    return borderColorMap[node.data.color.border] || '#d1d5db';
  }
}
