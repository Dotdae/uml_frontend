import { Injectable } from '@angular/core';
import { Node } from '../../domain/models/node.model';
import { Edge } from '../../domain/models/edge.model';

export interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private history: DiagramState[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50;

  constructor() {}

  /**
   * Save the current state to history
   * @param nodes - Current nodes
   * @param edges - Current edges
   */
  saveState(nodes: Node[], edges: Edge[]): void {
    // Remove any states after current index (when user made changes after undo)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Create deep copy of current state
    const state: DiagramState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      timestamp: Date.now()
    };

    // Add new state
    this.history.push(state);
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    console.log('State saved. History length:', this.history.length, 'Current index:', this.currentIndex);
  }

  /**
   * Undo the last action
   * @returns Previous state or null if no undo available
   */
  undo(): DiagramState | null {
    if (!this.canUndo()) {
      return null;
    }

    this.currentIndex--;
    const previousState = this.history[this.currentIndex];
    console.log('Undo executed. Current index:', this.currentIndex);

    return {
      nodes: JSON.parse(JSON.stringify(previousState.nodes)),
      edges: JSON.parse(JSON.stringify(previousState.edges)),
      timestamp: previousState.timestamp
    };
  }

  /**
   * Redo the next action
   * @returns Next state or null if no redo available
   */
  redo(): DiagramState | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentIndex++;
    const nextState = this.history[this.currentIndex];
    console.log('Redo executed. Current index:', this.currentIndex);

    return {
      nodes: JSON.parse(JSON.stringify(nextState.nodes)),
      edges: JSON.parse(JSON.stringify(nextState.edges)),
      timestamp: nextState.timestamp
    };
  }

  /**
   * Check if undo is available
   * @returns True if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is available
   * @returns True if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Clear the history
   */
  clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get the current state index
   * @returns Current index in history
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Get the total history length
   * @returns History length
   */
  getHistoryLength(): number {
    return this.history.length;
  }
}
