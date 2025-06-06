import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, Input, Output, EventEmitter, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EFConnectionBehavior, EFMarkerType, FZoomDirective, FDragStartedEvent, FCreateConnectionEvent, FFlowModule, FCanvasComponent, FTriggerEvent } from '@foblex/flow';
import { FormsModule } from '@angular/forms';
import { FlexFlowService, DiagramType } from '../../../infrastructure/diagram/flex-flow.service';
import { HistoryService } from '../../../infrastructure/diagram/history.service';
import { Node } from '../../../domain/models/node.model';
import { Edge } from '../../../domain/models/edge.model';
import { DiagramService } from '../../../core/services/diagram.service';

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
  @Input() diagramId: string | null = null;
  @Output() nodeSelected = new EventEmitter<string>();

  public connections: Edge[] = [];
  public nodes: Node[] = [];
  public eConnectionBehaviour = EFConnectionBehavior;
  public eMarkerType = EFMarkerType;
  public currentType: DiagramType = 'CLASS';
  public diagramTypes: DiagramType[] = ['CLASS', 'SEQUENCE', 'PACKAGE', 'USECASE', 'COMPONENTS'];
  protected events = signal<string[]>([])

  @ViewChild(FZoomDirective, { static: true })
  protected fZoom!: FZoomDirective;
  @ViewChild(FCanvasComponent, { static: true })
  protected fCanvas!: FCanvasComponent;

  // Zoom controls
  public zoomLevel: number = 0.1;
  public minZoom: number = 0.05;
  public maxZoom: number = 2;
  public zoomStep: number = 0.1;

  // Custom trigger for capturing node positions
  protected nodePositionTrigger = (event: FTriggerEvent) => {
    // This trigger will be active when no special key is pressed (default behavior)
    // You can modify this condition based on your needs
    return !event.ctrlKey && !event.shiftKey && !event.altKey;
  };

  // Store node positions during drag operations
  private dragStartPositions: Map<string, { x: number, y: number }> = new Map();

  // Loading state for diagram loading
  public isLoading: boolean = false;
  public loadingMessage: string = 'Cargando diagrama...';

  // Selected relation for connections
  public selectedRelationType: string | null = null;
  public selectedRelationLabel: string | null = null;

  // Selected connection for deletion
  public selectedConnectionId: string | null = null;

  // Destruction marker dragging
  private isDraggingDestruction: boolean = false;
  private dragStartY: number = 0;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private flexFlowService: FlexFlowService,
    private ngZone: NgZone,
    private historyService: HistoryService,
    private diagramService: DiagramService
  ) {}

  onFlowLoaded() {
    this.fCanvas.resetScaleAndCenter(true);
    // Hide loading spinner when flow is loaded
    this.isLoading = false;
    console.log('Flow loaded, hiding spinner');
  }
  ngAfterViewInit() {
    // Initialize the diagram after view is ready
    setTimeout(() => {
      this.showLoadingSpinner('Initializing diagram...');

      console.log('loadDiagram', this.currentType);
      console.log('diagramId', this.diagramId);
      this.diagramService.getDiagram(Number(this.diagramId)).subscribe((diagram) => {
        console.log('diagram', diagram);
      });
      this.loadDiagram(this.currentType, this.diagramId || '');
    });
  }

  loadDiagram(type: DiagramType, diagramId: string) {
    this.showLoadingSpinner('Cargando diagrama...');

    this.currentType = type;
    // Don't initialize with default nodes when loading an existing diagram
    if (!diagramId) {
      const { nodes, edges } = this.flexFlowService.initDiagram(type);
      this.nodes = nodes;
      this.connections = edges;
    }

    this.nodes.forEach(node => {
      console.log('node', node.position);
    });

    // Force change detection
    this.changeDetectorRef.detectChanges();

    // Restore selected relation from the most recent connection if available
    if (this.connections.length > 0) {
      const lastConnection = this.connections[this.connections.length - 1];
      if (lastConnection.data?.relationTypeSelected && lastConnection.data?.relationLabelSelected) {
        this.selectedRelationType = lastConnection.data.relationTypeSelected;
        this.selectedRelationLabel = lastConnection.data.relationLabelSelected;
      }
    }
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
    // Check if we're typing in an input field - if so, don't handle shortcuts
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

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
    } else if (!isInputField) {
      // Only handle these shortcuts when NOT typing in input fields
      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          event.preventDefault();
          if (this.selectedConnectionId) {
            this.removeConnection(this.selectedConnectionId);
            this.selectedConnectionId = null;
          }
          break;
        case 'Escape':
          // Clear selection
          this.selectedConnectionId = null;
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

    // Use selected relation if available, otherwise fall back to default
    const relationLabel = this.selectedRelationLabel || 'relation';
    const relationType = this.selectedRelationType || 'association';

    switch (this.currentType) {
      case 'CLASS':
        newEdge = this.flexFlowService.createClassRelationship(sourceId!, targetId, relationType, relationLabel);
        break;
      case 'SEQUENCE':
        newEdge = this.flexFlowService.createSequenceMessage(sourceId!, targetId, 'message');
        // Update the label and type for sequence messages
        newEdge.label = relationLabel;
        newEdge.type = relationType;
        break;
      case 'PACKAGE':
        newEdge = this.flexFlowService.createPackageDependency(sourceId!, targetId, relationLabel);
        // Set the relation type for package dependencies
        newEdge.type = relationType;
        break;
      case 'USECASE':
        newEdge = this.flexFlowService.createUseCaseAssociation(sourceId!, targetId);
        // Update the label and type for use case relations
        newEdge.label = relationLabel;
        newEdge.type = relationType;
        break;
      case 'COMPONENTS':
        newEdge = this.flexFlowService.createComponentDependency(sourceId!, targetId, relationLabel);
        // Set the relation type for component dependencies
        newEdge.type = relationType;
        break;
      default:
        return;
    }

    // Store additional relation metadata in the edge data
    if (!newEdge.data) {
      newEdge.data = {};
    }
    newEdge.data.relationTypeSelected = this.selectedRelationType || undefined;
    newEdge.data.relationLabelSelected = this.selectedRelationLabel || undefined;

    // Add the new edge to the component's connections array
    this.connections = [...this.connections, newEdge];
    // Also add to service for consistency
    this.flexFlowService.addEdge(newEdge);

    // Force change detection
    this.changeDetectorRef.detectChanges();

    // Save state after modification
    this.saveCurrentState();
  }

  // Add helper method for calculating new node position
  private getNewNodePosition(): { x: number; y: number } {
    if (this.nodes.length === 0) {
      return { x: 100, y: 100 };
    }

    // Find the rightmost and bottommost positions
    const positions = this.nodes.map(node => node.position);
    const maxX = Math.max(...positions.map(p => p.x));
    const maxY = Math.max(...positions.map(p => p.y));

    // If we're getting too far to the right, start a new row
    if (maxX > 600) {
      return { x: 100, y: maxY + 100 };
    }

    // Otherwise, place the node to the right with some spacing
    return { x: maxX + 150, y: positions[positions.length - 1].y };
  }

  addNode() {
    // Generate a simple unique ID
    const newId = `${this.nodes.length + 10}`;
    const position = this.getNewNodePosition();
    let newNode: Node;

    switch (this.currentType) {
      case 'CLASS':
        newNode = this.flexFlowService.createClassNode(newId, 'NewClass', position);
        break;
      case 'SEQUENCE':
        newNode = this.flexFlowService.createActorNode(newId, 'NewActor', position);
        break;
      case 'PACKAGE':
        newNode = this.flexFlowService.createPackageNode(newId, 'NewPackage', position);
        break;
      case 'USECASE':
        newNode = this.flexFlowService.createUseCaseNode(newId, 'NewUseCase', position);
        break;
      case 'COMPONENTS':
        newNode = this.flexFlowService.createComponentNode(newId, 'NewComponent', position);
        break;
      default:
        return;
    }

    // Add to both component array and service array for consistency
    this.nodes = [...this.nodes, newNode];
    this.flexFlowService.addNode(newNode);

    // Save state after modification
    this.saveCurrentState();
  }

  addInterfaceNode() {
    const newId = `${this.nodes.length + 10}`;
    const position = this.getNewNodePosition();
    const newNode = this.flexFlowService.createInterfaceNode(newId, 'NewInterface', position);

    this.nodes = [...this.nodes, newNode];
    this.flexFlowService.addNode(newNode);
    this.saveCurrentState();
  }

  addPackageNode() {
    const newId = `${this.nodes.length + 10}`;
    const position = this.getNewNodePosition();
    const newNode = this.flexFlowService.createPackageNode(newId, 'NewPackage', position);

    this.nodes = [...this.nodes, newNode];
    this.flexFlowService.addNode(newNode);
    this.saveCurrentState();
  }

  addActorNode() {
    const newId = `${this.nodes.length + 10}`;
    const position = this.getNewNodePosition();
    const newNode = this.flexFlowService.createActorNode(newId, 'NewActor', position);

    this.nodes = [...this.nodes, newNode];
    this.flexFlowService.addNode(newNode);
    this.saveCurrentState();
  }

  addUseCaseNode() {
    const newId = `${this.nodes.length + 10}`;
    const position = this.getNewNodePosition();
    const newNode = this.flexFlowService.createUseCaseNode(newId, 'NewUseCase', position);

    this.nodes = [...this.nodes, newNode];
    this.flexFlowService.addNode(newNode);
    this.saveCurrentState();
  }

  addComponentNode() {
    const newId = `${this.nodes.length + 10}`;
    const position = this.getNewNodePosition();
    const newNode = this.flexFlowService.createComponentNode(newId, 'NewComponent', position);

    this.nodes = [...this.nodes, newNode];
    this.flexFlowService.addNode(newNode);
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

  @HostListener('mouseup', ['$event'])
  handleMouseUp(event: MouseEvent) {
    try {
      const selection = window.getSelection();
      if (selection) {
        // Clear any existing selections to prevent IndexSizeError
        selection.removeAllRanges();
      }
    } catch (error) {
      console.error('Error handling mouse up:', error);
    }
  }

  exportDiagram() {
    try {
      // Create a clean export of nodes with their current positions
      const nodes = this.nodes.map(node => {
        console.log(`Exporting node ${node.id} with position:`, node.position);
        return {
          id: node.id,
          type: node.type,
          data: node.data,
          position: {
            x: node.position.x,
            y: node.position.y
          }
        };
      });

      // Create a clean export of connections
      const connections = this.connections.map(connection => ({
        id: connection.id,
        source: connection.source,
        target: connection.target,
        type: connection.type,
        label: connection.label,
        data: connection.data ? {
          strokeStyle: connection.data.strokeStyle,
          arrowStyle: connection.data.arrowStyle,
          relationTypeSelected: connection.data.relationTypeSelected,
          relationLabelSelected: connection.data.relationLabelSelected
        } : undefined
      }));

      return {
        type: this.currentType,
        nodes: nodes,
        connections: connections
      };
    } catch (error) {
      console.error('Error exporting diagram:', error);
      return null;
    }
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

  onPropertyInput(nodeId: string, index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const node = this.nodes.find(n => n.id === nodeId);
    if (node && node.data.properties) {
      node.data.properties[index] = input.value;
    }
  }

  onMethodInput(nodeId: string, index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const node = this.nodes.find(n => n.id === nodeId);
    if (node && node.data.methods) {
      node.data.methods[index] = input.value;
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

  selectConnection(connectionId: string): void {
    this.selectedConnectionId = connectionId;
    console.log(`Selected connection: ${connectionId}`);
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

  addSequenceObject() {
    const newId = `${this.nodes.length + 10}`;
    const position = { x: 200 + this.nodes.length * 150, y: 50 };
    const newNode = this.flexFlowService.createSequenceObject(newId, 'Object', position);

    this.nodes = [...this.nodes, newNode];
    this.flexFlowService.addNode(newNode);
    this.saveCurrentState();
  }

  addActivationBox() {
    const newId = `activation-${this.nodes.length + 10}`;
    const position = { x: 200 + this.nodes.length * 150, y: 150 };
    const newNode = {
      id: newId,
      type: 'activation',
      position: position,
      data: {
        label: '',
        type: 'activation',
        width: 20,
        height: 80
      }
    };

    this.nodes = [...this.nodes, newNode];
    this.flexFlowService.addNode(newNode);
    this.saveCurrentState();
  }

  addSyncMessage(source: string, target: string) {
    const newEdge: Edge = {
      id: `edge-${this.connections.length + 1}`,
      source: source,
      target: target,
      label: 'syncMessage()',
      type: 'sync',
      data: {
        strokeStyle: 'solid',
        arrowStyle: 'filled'
      },
    };

    this.connections = [...this.connections, newEdge];
    this.flexFlowService.addEdge(newEdge);
    this.saveCurrentState();
  }

  addAsyncMessage(source: string, target: string) {
    const newEdge: Edge = {
      id: `edge-${this.connections.length + 1}`,
      source: source,
      target: target,
      label: 'asyncMessage()',
      type: 'async',
      data: {
        strokeStyle: 'dashed',
        arrowStyle: 'open'
      }
    };

    this.connections = [...this.connections, newEdge];
    this.flexFlowService.addEdge(newEdge);
    this.saveCurrentState();
  }

  addReturnMessage(source: string, target: string) {
    const newEdge: Edge = {
      id: `edge-${this.connections.length + 1}`,
      source: source,
      target: target,
      label: 'return',
      type: 'return',
      data: {
        strokeStyle: 'dashed',
        arrowStyle: 'open'
      }
    };

    this.connections = [...this.connections, newEdge];
    this.flexFlowService.addEdge(newEdge);
    this.saveCurrentState();
  }

  destroyObject(nodeId: string) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      node.data.destroyed = true;
      this.changeDetectorRef.detectChanges();
      this.saveCurrentState();
    }
  }

  loadContent(content: any) {
    try {
      this.showLoadingSpinner('Cargando contenido del diagrama...');

      if (content && content.nodes && content.connections) {
        console.log('Loading diagram content:', content);

        // Clear existing nodes and connections
        this.nodes = [];
        this.connections = [];

        // Load nodes with their exact saved positions
        this.nodes = content.nodes.map((node: any) => {
          const position = {
            x: Number(node.position.x),
            y: Number(node.position.y)
          };
          console.log(`Loading node ${node.id} with position:`, position);

          return {
            id: node.id,
            type: node.type,
            data: node.data,
            position: position
          };
        });

        // Load connections
        this.connections = content.connections.map((connection: any) => {
          // Prioritize stored relation label over generic connection label
          let connectionLabel = connection.data?.relationLabelSelected || connection.label || '';

          return {
            id: connection.id,
            source: connection.source,
            target: connection.target,
            type: connection.type || 'association',
            label: connectionLabel,
            data: connection.data ? {
              strokeStyle: connection.data.strokeStyle,
              arrowStyle: connection.data.arrowStyle,
              relationTypeSelected: connection.data.relationTypeSelected,
              relationLabelSelected: connection.data.relationLabelSelected
            } : undefined
          };
        });

        // Set the current type
        if (content.type) {
          this.currentType = content.type;
        }

        // Force change detection
        this.changeDetectorRef.detectChanges();

        // Restore selected relation from the most recent connection if available
        if (this.connections.length > 0) {
          const lastConnection = this.connections[this.connections.length - 1];
          if (lastConnection.data?.relationTypeSelected && lastConnection.data?.relationLabelSelected) {
            this.selectedRelationType = lastConnection.data.relationTypeSelected;
            this.selectedRelationLabel = lastConnection.data.relationLabelSelected;
          }
        }

        // Hide loading spinner after content is loaded
        setTimeout(() => {
          this.hideLoadingSpinner();
        }, 300);
      } else {
        this.hideLoadingSpinner();
      }
    } catch (error) {
      console.error('Error loading diagram content:', error);
      this.hideLoadingSpinner();
    }
  }

  // Update the handleSelectionChange method to properly handle the selection error
  @HostListener('document:selectionchange', ['$event'])
  handleSelectionChange(event: Event) {
    try {
      const selection = window.getSelection();
      if (!selection) return;

      // Only clear selection if it exists and has ranges
      if (selection.rangeCount > 0) {
        selection.removeAllRanges();
      }
    } catch (error) {
      // Silently handle the error - no need to log or propagate
      event.preventDefault();
    }
  }

  protected onDragStarted(event: FDragStartedEvent): void {
    console.log('onDragStarted', event);
    console.log(this.nodes);

    // Access node ID from the actual event structure
    const nodeIds = event.fData?.fNodeIds;
    if (nodeIds && nodeIds.length > 0) {
      nodeIds.forEach((nodeId: string) => {
        console.log('Node ID from event:', nodeId);

        // Find the actual node to get its position
        const node = this.nodes.find(n => n.id === nodeId);
        if (node) {
          console.log('Node position at drag start:', node.position);
          console.log('Node data:', node.data);

          // Store the initial position for this drag operation
          this.dragStartPositions.set(nodeId, { ...node.position });

          // You can now use the position for whatever you need
          const { x, y } = node.position;
          console.log(`Node ${nodeId} drag started at position: x=${x}, y=${y}`);

          // Emit custom event with position data
          this.onNodePositionChange(nodeId, node.position, 'drag-start');
        } else {
          console.warn('Node not found in nodes array:', nodeId);
        }
      });
    } else {
      console.warn('No node IDs found in event data');
    }

    this.events.update((x) => {
      const nodeId = event.fData?.fNodeIds?.[0];
      const node = nodeId ? this.nodes.find(n => n.id === nodeId) : null;
      const position = node ? `x=${node.position.x}, y=${node.position.y}` : 'unknown';

      x = x.concat(`EVENT: ${ event.fEventType }, NODE: ${nodeId}, POSITION: ${position}`);
      console.log('events', x);
      return x;
    });
  }

  // Handle drag move events to capture real-time position updates
  protected onDragMove(event: any): void {
    console.log('onDragMove', event);

    const nodeIds = event.fData?.fNodeIds;
    if (nodeIds && nodeIds.length > 0) {
      nodeIds.forEach((nodeId: string) => {
        // Try to get position from event data
        const eventPosition = event.fData?.position || event.fData;

        if (eventPosition && (eventPosition.x !== undefined || eventPosition.y !== undefined)) {
          const node = this.nodes.find(n => n.id === nodeId);
          if (node) {
            // Update node position with new coordinates
            node.position = {
              x: eventPosition.x || node.position.x,
              y: eventPosition.y || node.position.y
            };

            console.log(`Node ${nodeId} moved to:`, node.position);
            this.onNodePositionChange(nodeId, node.position, 'drag-move');
          }
        }
      });
    }

    // Force change detection to update UI
    this.changeDetectorRef.detectChanges();
  }

  // Handle drag end events to capture final position
  protected onDragEnded(event: any): void {
    console.log('onDragEnded', event);

    // Use a more direct approach to get updated positions
    setTimeout(() => {
      this.syncAllNodePositions();
    }, 100);

    this.changeDetectorRef.detectChanges();
  }

  // Method to sync all node positions from the canvas
  private syncAllNodePositions(): void {
    console.log('Syncing all node positions...');

    this.nodes.forEach(node => {
      const updatedPosition = this.getNodePositionFromCanvas(node.id);
      if (updatedPosition) {
        const hasChanged =
          Math.abs(node.position.x - updatedPosition.x) > 1 ||
          Math.abs(node.position.y - updatedPosition.y) > 1;

        if (hasChanged) {
          console.log(`Node ${node.id} position updated:`, {
            old: node.position,
            new: updatedPosition
          });

          node.position = updatedPosition;
          this.onNodePositionChange(node.id, updatedPosition, 'position-sync');
        }
      }
    });

    // Save state after all positions are updated
    this.saveCurrentState();
  }

  // Method to get a specific node's position from the canvas
  private getNodePositionFromCanvas(nodeId: string): { x: number, y: number } | null {
    try {
      const nodeElement = document.getElementById(nodeId);
      if (!nodeElement) {
        return null;
      }

      // Get the computed transform
      const computedStyle = window.getComputedStyle(nodeElement);
      const transform = computedStyle.transform;

      if (transform && transform !== 'none') {
        // Parse the matrix transform: matrix(a, b, c, d, e, f)
        // where e = translateX and f = translateY
        const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
        if (matrixMatch) {
          const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
          if (values.length >= 6) {
            const x = values[4]; // translateX (e)
            const y = values[5]; // translateY (f)

            console.log(`Node ${nodeId} transform extracted: x=${x}, y=${y}`);
            return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 }; // Round to 2 decimal places
          }
        }

        // Fallback: try to parse translate() format
        const translateMatch = transform.match(/translate\(([^)]+)\)/);
        if (translateMatch) {
          const values = translateMatch[1].split(',').map(v => parseFloat(v.replace('px', '').trim()));
          if (values.length >= 2) {
            const x = values[0];
            const y = values[1];

            console.log(`Node ${nodeId} translate extracted: x=${x}, y=${y}`);
            return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
          }
        }
      }

      return null;
    } catch (error) {
      console.error(`Error getting position for node ${nodeId}:`, error);
      return null;
    }
  }

  // New method to handle position changes
  onNodePositionChange(nodeId: string, position: { x: number, y: number }, eventType: string): void {
    console.log(`Node Position Event: ${eventType}`, {
      nodeId,
      position,
      timestamp: new Date().toISOString()
    });

    // You can add custom logic here based on position changes
    // For example, save to history, sync with backend, etc.

    // Example: Check if node moved significantly
    const startPosition = this.dragStartPositions.get(nodeId);
    if (startPosition && eventType === 'drag-end') {
      const distance = Math.sqrt(
        Math.pow(position.x - startPosition.x, 2) +
        Math.pow(position.y - startPosition.y, 2)
      );

      if (distance > 5) { // Only log if moved more than 5 pixels
        console.log(`Node ${nodeId} moved ${distance.toFixed(2)} pixels from start position`);

        // Save state for undo/redo functionality
        this.saveCurrentState();
      }

      // Clean up stored position
      this.dragStartPositions.delete(nodeId);
    }
  }

  // Method to get all current node positions
  getAllNodePositions(): { [nodeId: string]: { x: number, y: number } } {
    const positions: { [nodeId: string]: { x: number, y: number } } = {};

    this.nodes.forEach(node => {
      // Try to get the real position from DOM
      const realPosition = this.getNodePositionFromCanvas(node.id);
      if (realPosition) {
        // Update the node's stored position with the real position
        node.position = realPosition;
        positions[node.id] = realPosition;
      } else {
        // Fall back to stored position
        positions[node.id] = { ...node.position };
      }
    });

    console.log('All current node positions:', positions);
    return positions;
  }

  // Method to manually refresh all positions (for testing)
  refreshNodePositions(): void {
    console.log('Manually refreshing node positions...');

    this.nodes.forEach(node => {
      const currentStoredPosition = { ...node.position };
      const realPosition = this.getNodePositionFromCanvas(node.id);

      if (realPosition) {
        console.log(`Node ${node.id}: stored=${JSON.stringify(currentStoredPosition)}, real=${JSON.stringify(realPosition)}`);

        // Update stored position to match real position
        node.position = realPosition;
      }
    });

    // Force update
    this.changeDetectorRef.detectChanges();

    // Show updated positions
    this.getAllNodePositions();
  }

  // Debug method to understand what's available
  debugCanvasData(): void {
    console.log('=== DEBUG CANVAS DATA ===');
    console.log('fCanvas component:', this.fCanvas);
    console.log('canvasRef element:', this.canvasRef);
    console.log('fCanvasRef element:', this.fCanvasRef);

    // Check all nodes in DOM
    this.nodes.forEach(node => {
      const element = document.getElementById(node.id);
      if (element) {
        console.log(`Node ${node.id} DOM element:`, {
          element,
          offsetLeft: element.offsetLeft,
          offsetTop: element.offsetTop,
          style: element.style.cssText,
          transform: window.getComputedStyle(element).transform,
          boundingRect: element.getBoundingClientRect()
        });
      }
    });

    // Try to access canvas internal data
    if (this.fCanvas) {
      console.log('Canvas internals:', {
        fCanvas: this.fCanvas,
        properties: Object.getOwnPropertyNames(this.fCanvas),
        proto: Object.getPrototypeOf(this.fCanvas)
      });
    }
  }

  // Method to track position changes over time
  trackNodePositions(): void {
    const positions = this.getAllNodePositions();

    // You can save this to local storage, send to backend, etc.
    localStorage.setItem('nodePositions_' + this.diagramId, JSON.stringify({
      timestamp: new Date().toISOString(),
      positions: positions
    }));

    console.log('Node positions tracked and saved');
  }

  // Simple test method to show positions
  testPositions(): void {
    console.log('=== TESTING POSITION EXTRACTION ===');

    this.nodes.forEach(node => {
      const storedPos = node.position;
      const extractedPos = this.getNodePositionFromCanvas(node.id);

      console.log(`Node ${node.id}:`, {
        stored: storedPos,
        extracted: extractedPos,
        match: extractedPos ?
          (Math.abs(storedPos.x - extractedPos.x) < 1 && Math.abs(storedPos.y - extractedPos.y) < 1) :
          false
      });
    });
  }

  // Method to show loading spinner
  showLoadingSpinner(message: string = 'Loading...') {
    this.loadingMessage = message;
    this.isLoading = true;
    console.log('Showing loading spinner:', message);
  }

  // Method to hide loading spinner
  hideLoadingSpinner() {
    this.isLoading = false;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Set the selected relation type for new connections
   */
  setSelectedRelation(relationType: string, relationLabel: string): void {
    this.selectedRelationType = relationType;
    this.selectedRelationLabel = relationLabel;
    console.log(`Relation selected in FlexFlow: ${relationType} (${relationLabel})`);
  }

  getPlaceholderForConnection(connection: Edge): string {
    if (this.currentType === 'SEQUENCE') {
      switch (connection.type) {
        case 'mensaje': return 'mensaje()';
        case 'activacion': return 'activate';
        case 'custom': return 'Enter custom message...';
        default:
          // If it has a selected relation label, use it as placeholder
          if (connection.data?.relationLabelSelected && connection.data.relationLabelSelected !== 'Custom Message') {
            return connection.data.relationLabelSelected;
          }
          return connection.data?.relationLabelSelected || 'message()';
      }
    }
    return connection.data?.relationLabelSelected || 'relation';
  }

  getDestructionY(node: Node): number {
    return (node.data as any).destructionY || 350;
  }

  // Destruction marker management
  addDestructionMarker(nodeId: string): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      (node.data as any).destroyed = true;
      (node.data as any).destructionY = 300; // Default position
      this.saveCurrentState();
      this.changeDetectorRef.detectChanges();
    }
  }

  removeDestructionMarker(nodeId: string): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      (node.data as any).destroyed = false;
      delete (node.data as any).destructionY;
      this.saveCurrentState();
      this.changeDetectorRef.detectChanges();
    }
  }

  // Destruction marker dragging
  startDragDestruction(event: MouseEvent, nodeId: string): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDraggingDestruction = true;
    this.dragStartY = event.clientY;

    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const currentY = (node.data as any).destructionY || 300;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!this.isDraggingDestruction) return;

      const deltaY = moveEvent.clientY - this.dragStartY;
      const newY = Math.max(150, Math.min(500, currentY + deltaY));

      (node.data as any).destructionY = newY;
      this.changeDetectorRef.detectChanges();
    };

    const onMouseUp = () => {
      this.isDraggingDestruction = false;
      this.saveCurrentState();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

}
