import { Injectable } from '@angular/core';
import { FlexFlowService, DiagramType } from './flex-flow.service';

@Injectable({
  providedIn: 'root'
})
export class DiagramJsonExportService {

  constructor(private flexFlowService: FlexFlowService) {}

  /**
   * Export all diagram types as JSON with realistic data
   * @returns Object containing all diagram types with their JSON representations
   */
  exportAllDiagramTypes(): { [key: string]: string } {
    const exports: { [key: string]: string } = {};

    const diagramTypes: DiagramType[] = ['class', 'sequence', 'package', 'usecase', 'component'];

    diagramTypes.forEach(type => {
      this.flexFlowService.initDiagram(type);
      exports[type] = this.flexFlowService.exportDiagram();
    });

    return exports;
  }

  /**
   * Export a specific diagram type as JSON
   * @param type - The diagram type to export
   * @returns JSON string of the diagram
   */
  exportDiagramType(type: DiagramType): string {
    this.flexFlowService.initDiagram(type);
    return this.flexFlowService.exportDiagram();
  }

  /**
   * Get formatted JSON for a specific diagram type
   * @param type - The diagram type to format
   * @returns Formatted JSON string
   */
  getFormattedDiagramJson(type: DiagramType): string {
    const jsonString = this.exportDiagramType(type);
    return JSON.stringify(JSON.parse(jsonString), null, 2);
  }

  /**
   * Download JSON file for a specific diagram type
   * @param type - The diagram type to download
   */
  downloadDiagramJson(type: DiagramType): void {
    const jsonString = this.getFormattedDiagramJson(type);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-diagram-sample.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Download all diagram types as separate JSON files
   */
  downloadAllDiagramJson(): void {
    const diagramTypes: DiagramType[] = ['class', 'sequence', 'package', 'usecase', 'component'];

    diagramTypes.forEach(type => {
      setTimeout(() => {
        this.downloadDiagramJson(type);
      }, 100 * diagramTypes.indexOf(type)); // Stagger downloads
    });
  }

  /**
   * Get sample data summary for all diagram types
   * @returns Summary of all diagram types with node and edge counts
   */
  getDiagramSummary(): { [key: string]: { nodes: number, edges: number, description: string } } {
    const summary: { [key: string]: { nodes: number, edges: number, description: string } } = {};
    const diagramTypes: DiagramType[] = ['class', 'sequence', 'package', 'usecase', 'component'];

    diagramTypes.forEach(type => {
      const data = this.flexFlowService.initDiagram(type);
      summary[type] = {
        nodes: data.nodes.length,
        edges: data.edges.length,
        description: this.getDiagramDescription(type)
      };
    });

    return summary;
  }

  /**
   * Get description for diagram type
   * @param type - The diagram type
   * @returns Description of the diagram type
   */
  private getDiagramDescription(type: DiagramType): string {
    const descriptions = {
      'class': 'E-commerce system with User, Order, Product, Payment classes and Notifiable interface',
      'sequence': 'Complete customer checkout flow with web interface, services, payment gateway, database, and email notifications',
      'package': 'Layered e-commerce architecture with UI, API, services, data access, integration, and security layers',
      'usecase': 'E-commerce platform use cases for customers and administrators with payment gateway integration',
      'component': 'Microservices architecture with web app, API gateway, business services, and external integrations'
    };
    return descriptions[type] || 'Diagram description not available';
  }

  /**
   * Generate all sample JSON files and return as a zip-like structure
   * @returns Object with all diagram JSONs for bulk operations
   */
  generateAllSampleFiles(): { [filename: string]: string } {
    const files: { [filename: string]: string } = {};
    const diagramTypes: DiagramType[] = ['class', 'sequence', 'package', 'usecase', 'component'];

    diagramTypes.forEach(type => {
      const jsonContent = this.getFormattedDiagramJson(type);
      files[`${type}-diagram-sample.json`] = jsonContent;
    });

    // Add a summary file
    const summary = this.getDiagramSummary();
    files['diagram-summary.json'] = JSON.stringify(summary, null, 2);

    return files;
  }
}
