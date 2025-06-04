import { Injectable } from '@angular/core';
import { Observable, Subject, of, throwError } from 'rxjs';
import { DiagramManagementService } from './diagram-management.service';
import { Diagram, DIAGRAM_TYPES } from '../models/diagram.model';

export interface CanvasElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, any>;
}

export interface CanvasConnection {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  points?: { x: number; y: number }[];
  properties: Record<string, any>;
}

export interface CanvasData {
  elements: CanvasElement[];
  connections: CanvasConnection[];
  metadata?: {
    version: number;
    lastModified: string;
    zoom?: number;
    viewPosition?: { x: number; y: number };
  };
}

@Injectable({
  providedIn: 'root'
})
export class DiagramCanvasService {
  // Change events
  private canvasChangedSubject = new Subject<CanvasData>();
  canvasChanged$ = this.canvasChangedSubject.asObservable();

  // Canvas data
  private currentCanvas: CanvasData | null = null;
  private activeDiagram: Diagram | null = null;

  constructor(private diagramManager: DiagramManagementService) {}

  /**
   * Initialize canvas with a diagram
   */
  initializeCanvas(diagram: Diagram): Observable<CanvasData> {
    this.activeDiagram = diagram;

    try {
      if (diagram.infoJson) {
        // Parse existing diagram data
        const canvasData = JSON.parse(diagram.infoJson) as CanvasData;
        this.currentCanvas = canvasData;
        return of(canvasData);
      } else {
        // Create a new empty canvas based on diagram type
        const emptyCanvas = this.createEmptyCanvas(diagram.type);
        this.currentCanvas = emptyCanvas;
        return of(emptyCanvas);
      }
    } catch (error) {
      console.error('Error initializing canvas:', error);
      // If parsing fails, create a new empty canvas
      const emptyCanvas = this.createEmptyCanvas(diagram.type);
      this.currentCanvas = emptyCanvas;
      return of(emptyCanvas);
    }
  }

  /**
   * Save canvas changes to the diagram
   */
  saveCanvasChanges(): Observable<Diagram | null> {
    if (!this.activeDiagram || !this.currentCanvas) {
      return throwError(() => new Error('No active diagram to save'));
    }

    // Update metadata
    if (!this.currentCanvas.metadata) {
      this.currentCanvas.metadata = {
        version: 1,
        lastModified: new Date().toISOString()
      };
    } else {
      this.currentCanvas.metadata.lastModified = new Date().toISOString();
      this.currentCanvas.metadata.version = (this.currentCanvas.metadata.version || 0) + 1;
    }

    const serializedCanvas = JSON.stringify(this.currentCanvas);

    return this.diagramManager.updateDiagramContent(
      this.activeDiagram.id,
      serializedCanvas
    );
  }

  /**
   * Update canvas data
   */
  updateCanvas(canvasData: CanvasData): void {
    this.currentCanvas = canvasData;
    this.canvasChangedSubject.next(canvasData);

    // Mark for auto-save
    this.diagramManager.markAsPendingChanges();
  }

  /**
   * Get the current canvas data
   */
  getCurrentCanvas(): CanvasData | null {
    return this.currentCanvas;
  }

  /**
   * Add a new element to the canvas
   */
  addElement(element: CanvasElement): void {
    if (!this.currentCanvas) {
      this.currentCanvas = this.createEmptyCanvas();
    }

    this.currentCanvas.elements.push(element);
    this.canvasChangedSubject.next(this.currentCanvas);

    // Mark for auto-save
    this.diagramManager.markAsPendingChanges();
  }

  /**
   * Update an existing element
   */
  updateElement(elementId: string, updates: Partial<CanvasElement>): void {
    if (!this.currentCanvas) return;

    const elementIndex = this.currentCanvas.elements.findIndex(e => e.id === elementId);
    if (elementIndex >= 0) {
      this.currentCanvas.elements[elementIndex] = {
        ...this.currentCanvas.elements[elementIndex],
        ...updates
      };

      this.canvasChangedSubject.next(this.currentCanvas);

      // Mark for auto-save
      this.diagramManager.markAsPendingChanges();
    }
  }

  /**
   * Remove an element from the canvas
   */
  removeElement(elementId: string): void {
    if (!this.currentCanvas) return;

    // Remove the element
    this.currentCanvas.elements = this.currentCanvas.elements.filter(e => e.id !== elementId);

    // Also remove any connections involving this element
    this.currentCanvas.connections = this.currentCanvas.connections.filter(
      c => c.fromId !== elementId && c.toId !== elementId
    );

    this.canvasChangedSubject.next(this.currentCanvas);

    // Mark for auto-save
    this.diagramManager.markAsPendingChanges();
  }

  /**
   * Add a connection between elements
   */
  addConnection(connection: CanvasConnection): void {
    if (!this.currentCanvas) {
      this.currentCanvas = this.createEmptyCanvas();
    }

    this.currentCanvas.connections.push(connection);
    this.canvasChangedSubject.next(this.currentCanvas);

    // Mark for auto-save
    this.diagramManager.markAsPendingChanges();
  }

  /**
   * Update an existing connection
   */
  updateConnection(connectionId: string, updates: Partial<CanvasConnection>): void {
    if (!this.currentCanvas) return;

    const connectionIndex = this.currentCanvas.connections.findIndex(c => c.id === connectionId);
    if (connectionIndex >= 0) {
      this.currentCanvas.connections[connectionIndex] = {
        ...this.currentCanvas.connections[connectionIndex],
        ...updates
      };

      this.canvasChangedSubject.next(this.currentCanvas);

      // Mark for auto-save
      this.diagramManager.markAsPendingChanges();
    }
  }

  /**
   * Remove a connection from the canvas
   */
  removeConnection(connectionId: string): void {
    if (!this.currentCanvas) return;

    this.currentCanvas.connections = this.currentCanvas.connections.filter(c => c.id !== connectionId);
    this.canvasChangedSubject.next(this.currentCanvas);

    // Mark for auto-save
    this.diagramManager.markAsPendingChanges();
  }

  /**
   * Export canvas as PNG
   */
  exportAsPNG(width: number, height: number): string {
    // This is a placeholder - actual implementation would convert the canvas to PNG
    // and return a data URL
    return '';
  }

  /**
   * Export canvas as SVG
   */
  exportAsSVG(): string {
    // This is a placeholder - actual implementation would convert the canvas to SVG
    // and return the SVG string
    return '';
  }

  /**
   * Create an empty canvas structure based on diagram type
   */
  private createEmptyCanvas(diagramType?: number): CanvasData {
    const now = new Date().toISOString();

    const emptyCanvas: CanvasData = {
      elements: [],
      connections: [],
      metadata: {
        version: 1,
        lastModified: now,
        zoom: 1,
        viewPosition: { x: 0, y: 0 }
      }
    };

    // Add template elements based on diagram type
    if (diagramType) {
      switch (diagramType) {
        case DIAGRAM_TYPES.CLASS:
          // Add a default class
          emptyCanvas.elements.push({
            id: 'class1',
            type: 'class',
            x: 100,
            y: 100,
            width: 200,
            height: 120,
            properties: {
              name: 'Class1',
              attributes: ['attribute1: Type'],
              methods: ['method1(): ReturnType']
            }
          });
          break;

        case DIAGRAM_TYPES.SEQUENCE:
          // Add default actors
          emptyCanvas.elements.push({
            id: 'actor1',
            type: 'actor',
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            properties: {
              name: 'Actor'
            }
          });

          emptyCanvas.elements.push({
            id: 'object1',
            type: 'object',
            x: 300,
            y: 50,
            width: 100,
            height: 50,
            properties: {
              name: 'Object'
            }
          });
          break;

        case DIAGRAM_TYPES.USECASE:
          // Add default actor and use case
          emptyCanvas.elements.push({
            id: 'actor1',
            type: 'actor',
            x: 100,
            y: 100,
            width: 50,
            height: 100,
            properties: {
              name: 'Actor'
            }
          });

          emptyCanvas.elements.push({
            id: 'usecase1',
            type: 'usecase',
            x: 300,
            y: 100,
            width: 150,
            height: 80,
            properties: {
              name: 'Use Case'
            }
          });
          break;

        case DIAGRAM_TYPES.COMPONENTS:
          // Add a default component
          emptyCanvas.elements.push({
            id: 'component1',
            type: 'component',
            x: 100,
            y: 100,
            width: 180,
            height: 100,
            properties: {
              name: 'Component',
              interfaces: ['Interface1']
            }
          });
          break;

        case DIAGRAM_TYPES.PACKAGE:
          // Add a default package
          emptyCanvas.elements.push({
            id: 'package1',
            type: 'package',
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            properties: {
              name: 'Package'
            }
          });
          break;
      }
    }

    return emptyCanvas;
  }
}
