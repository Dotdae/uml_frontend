import { Injectable } from '@angular/core';
import { Edge } from 'src/app/domain/models/edge.model';
import { Node } from 'src/app/domain/models/node.model';

export type DiagramType = 'class' | 'sequence' | 'package' | 'usecase' | 'component';

@Injectable({
  providedIn: 'root'
})

export class FlexFlowService {
  //* Node (elements) of the diagram
  private nodes: Node[] = [];
  //* Edges (connections) of the diagram
  private edges: Edge[] = [];
  //* The type of diagram to initialize (class, sequence, package, usecase, component)
  private currentType: DiagramType = 'class';

  constructor() { }

  /**
   * Initialize the diagram based on type
   * @param type - The type of diagram to initialize
   * @returns The nodes and edges of the diagram
   */
  public initDiagram(type: DiagramType = 'class'): { nodes: Node[], edges: Edge[] } {
    this.currentType = type;
    this.nodes = [];
    this.edges = [];

    switch (type) {
      case 'class':
        this.initClassDiagram();
        break;
      case 'sequence':
        this.initSequenceDiagram();
        break;
      case 'package':
        this.initPackageDiagram();
        break;
      case 'usecase':
        this.initUseCaseDiagram();
        break;
      case 'component':
        this.initComponentDiagram();
        break;
    }

    return { nodes: this.nodes, edges: this.edges };
  }

  /**
   * Initialize the class diagram
   */
  private initClassDiagram(): void {
    this.nodes = [
      {
        id: '1',
        type: 'class',
        data: {
          label: 'User',
          properties: ['- id: string', '- name: string', '- email: string'],
          methods: ['+ login()', '+ logout()', '+ updateProfile()']
        },
        position: { x: 100, y: 100 }
      },
      {
        id: '2',
        type: 'class',
        data: {
          label: 'Order',
          properties: ['- orderId: string', '- date: Date', '- total: number'],
          methods: ['+ create()', '+ cancel()', '+ updateStatus()']
        },
        position: { x: 400, y: 100 }
      }
    ];

    this.edges = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'association',
        label: 'creates',
        multiplicity: {
          source: '1',
          target: '*'
        }
      }
    ];
  }

  /**
   * Initialize the sequence diagram
   */
  private initSequenceDiagram(): void {
    this.nodes = [
      {
        id: '1',
        type: 'actor',
        data: {
          label: 'User',
          actor: true
        },
        position: { x: 100, y: 100 }
      },
      {
        id: '2',
        type: 'lifeline',
        data: {
          label: 'System',
          lifeline: true
        },
        position: { x: 300, y: 100 }
      }
    ];

    this.edges = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'message',
        message: 'login()',
        animated: true
      }
    ];
  }

  /**
   * Initialize the package diagram
   */
  private initPackageDiagram(): void {
    this.nodes = [
      {
        id: '1',
        type: 'package',
        data: {
          label: 'com.example',
          package: 'main'
        },
        position: { x: 100, y: 100 }
      },
      {
        id: '2',
        type: 'package',
        data: {
          label: 'com.example.util',
          package: 'util'
        },
        position: { x: 400, y: 100 }
      }
    ];

    this.edges = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'dependency',
        label: 'uses'
      }
    ];
  }

  /**
   * Initialize the use case diagram
   */
  private initUseCaseDiagram(): void {
    this.nodes = [
      {
        id: '1',
        type: 'actor',
        data: {
          label: 'User',
          actor: true
        },
        position: { x: 100, y: 200 }
      },
      {
        id: '2',
        type: 'usecase',
        data: {
          label: 'Login',
          usecase: true
        },
        position: { x: 300, y: 100 }
      }
    ];

    this.edges = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'association'
      }
    ];
  }

  /**
   * Initialize the component diagram
   */
  private initComponentDiagram(): void {
    this.nodes = [
      {
        id: '1',
        type: 'component',
        data: {
          label: 'UserService',
          component: true
        },
        position: { x: 100, y: 100 }
      },
      {
        id: '2',
        type: 'component',
        data: {
          label: 'Database',
          component: true
        },
        position: { x: 400, y: 100 }
      }
    ];

    this.edges = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'dependency',
        label: 'uses'
      }
    ];
  }

  /**
   * Create a class node
   * @param id - The id of the node
   * @param label - The label of the node
   * @param position - The position of the node
   * @returns The created node
   */
  createClassNode(id: string, label: string, position: { x: number, y: number }): Node {
    return {
      id,
      type: 'class',
      data: {
        label,
        properties: [],
        methods: []
      },
      position
    };
  }

  /**
   * Create an interface node
   * @param id - The id of the node
   * @param label - The label of the node
   * @param position - The position of the node
   * @returns The created node
   */
  createInterfaceNode(id: string, label: string, position: { x: number, y: number }): Node {
    return {
      id,
      type: 'interface',
      data: {
        label,
        properties: [],
        methods: [],
        isInterface: true
      },
      position
    };
  }

  /**
   * Create an actor node
   * @param id - The id of the node
   * @param label - The label of the node
   * @param position - The position of the node
   * @returns The created node
   */
  createActorNode(id: string, label: string, position: { x: number, y: number }): Node {
    return {
      id,
      type: 'actor',
      data: {
        label,
        actor: true
      },
      position
    };
  }

  /**
   * Create a package node
   * @param id - The id of the node
   * @param label - The label of the node
   * @param position - The position of the node
   * @returns The created node
   */
  createPackageNode(id: string, label: string, position: { x: number, y: number }): Node {
    return {
      id,
      type: 'package',
      data: {
        label,
        package: label
      },
      position
    };
  }

  /**
   * Create a use case node
   * @param id - The id of the node
   * @param label - The label of the node
   * @param position - The position of the node
   * @returns The created node
   */
  createUseCaseNode(id: string, label: string, position: { x: number, y: number }): Node {
    return {
      id,
      type: 'usecase',
      data: {
        label,
        usecase: true
      },
      position
    };
  }

  /**
   * Create a component node
   * @param id - The id of the node
   * @param label - The label of the node
   * @param position - The position of the node
   * @returns The created node
   */
  createComponentNode(id: string, label: string, position: { x: number, y: number }): Node {
    return {
      id,
      type: 'component',
      data: {
        label,
        component: true
      },
      position
    };
  }

  /**
   * Create a class relationship
   * @param sourceId - The id of the source node
   * @param targetId - The id of the target node
   * @param type - The type of relationship
   * @param label - The label of the relationship
   * @returns The created edge
   */
  createClassRelationship(sourceId: string, targetId: string, type: string, label?: string): Edge {
    const edge = {
      id: `e${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type,
      label,
      multiplicity: {
        source: '1',
        target: '*'
      }
    };
    return edge;
  }

  /**
   * Create a sequence message
   * @param sourceId - The id of the source node
   * @param targetId - The id of the target node
   * @param message - The message of the relationship
   * @returns The created edge
   */
  createSequenceMessage(sourceId: string, targetId: string, message: string): Edge {
    const edge = {
      id: `e${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: 'message',
      message,
      animated: true
    };
    return edge;
  }

  /**
   * Create a package dependency
   * @param sourceId - The id of the source node
   * @param targetId - The id of the target node
   * @param label - The label of the relationship
   * @returns The created edge
   */
  createPackageDependency(sourceId: string, targetId: string, label?: string): Edge {
    const edge = {
      id: `e${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: 'dependency',
      label
    };
    return edge;
  }

  /**
   * Create a use case association
   * @param sourceId - The id of the source node
   * @param targetId - The id of the target node
   * @returns The created edge
   */
  createUseCaseAssociation(sourceId: string, targetId: string): Edge {
    const edge = {
      id: `e${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: 'association'
    };
    return edge;
  }

  /**
   * Create a component dependency
   * @param sourceId - The id of the source node
   * @param targetId - The id of the target node
   * @param label - The label of the relationship
   * @returns The created edge
   */
  createComponentDependency(sourceId: string, targetId: string, label?: string): Edge {
    const edge = {
      id: `e${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: 'dependency',
      label
    };
    return edge;
  }

  /**
   * Add a node to the diagram
   * @param node - The node to add
   */
  addNode(node: Node): void {
    this.nodes.push(node);
  }

  /**
   * Add an edge to the diagram
   * @param edge - The edge to add
   */
  addEdge(edge: Edge): void {
    this.edges.push(edge);
  }

  /**
   * Remove a node from the diagram
   * @param nodeId - The id of the node to remove
   */
  removeNode(nodeId: string): void {
    this.nodes = this.nodes.filter(node => node.id !== nodeId);
    this.edges = this.edges.filter(edge =>
      edge.source !== nodeId && edge.target !== nodeId
    );
  }

  /**
   * Remove an edge from the diagram
   * @param edgeId - The id of the edge to remove
   */
  removeEdge(edgeId: string): void {
    this.edges = this.edges.filter(edge => edge.id !== edgeId);
  }

  /**
   * Update the position of a node
   * @param nodeId - The id of the node to update
   * @param position - The new position of the node
   */
  updateNodePosition(nodeId: string, position: { x: number, y: number }): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      node.position = position;
    }
  }

  /**
   * Update the data of a node
   * @param nodeId - The id of the node to update
   * @param data - The new data of the node
   */
  updateNodeData(nodeId: string, data: any): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      node.data = { ...node.data, ...data };
    }
  }

  /**
   * Get the nodes of the diagram
   * @returns The nodes of the diagram
   */
  getNodes(): Node[] {
    return this.nodes;
  }

  /**
   * Get the edges of the diagram
   * @returns The edges of the diagram
   */
  getEdges(): Edge[] {
    return this.edges;
  }

  /**
   * Get the current type of the diagram
   * @returns The current type of the diagram
   */
  getCurrentType(): DiagramType {
    return this.currentType;
  }

  /**
   * Export the diagram to a JSON string
   * @returns The JSON string of the diagram
   */
  exportDiagram(): string {
    return JSON.stringify({
      type: this.currentType,
      nodes: this.nodes,
      edges: this.edges
    });
  }

  /**
   * Import a diagram from a JSON string
   * @param json - The JSON string of the diagram
   */
  importDiagram(json: string): void {
    const data = JSON.parse(json);
    this.currentType = data.type;
    this.nodes = data.nodes;
    this.edges = data.edges;
  }
}
