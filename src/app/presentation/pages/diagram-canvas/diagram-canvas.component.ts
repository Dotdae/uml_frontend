import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, interval, timer } from 'rxjs';
import { DiagramManagementService, DiagramState } from 'src/app/core/services/diagram-management.service';
import { Diagram } from 'src/app/core/models/diagram.model';

@Component({
  selector: 'app-diagram-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="diagram-canvas" *ngIf="diagramState">
      <!-- Header with diagram info and actions -->
      <div class="canvas-header">
        <div class="diagram-info">
          <h1 class="diagram-title" *ngIf="currentDiagram">
            {{ currentDiagram.name }}
            <span class="diagram-type">({{ getDiagramTypeName(currentDiagram.type) }})</span>
          </h1>
          <div class="diagram-meta" *ngIf="currentDiagram">
            <span class="created">Created: {{ formatDate(currentDiagram.createdAt) }}</span>
            <span class="modified">Last modified: {{ formatDate(currentDiagram.updatedAt) }}</span>
          </div>
        </div>

        <div class="canvas-actions">
          <button
            class="btn btn-save"
            (click)="saveDiagram()"
            [disabled]="diagramState.loading || !hasUnsavedChanges"
            [class.saving]="isSaving">
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>

          <button
            class="btn btn-export"
            (click)="showExportMenu = !showExportMenu">
            Export
          </button>

          <div class="export-menu" *ngIf="showExportMenu">
            <button (click)="exportDiagram('json')">JSON</button>
            <button (click)="exportDiagram('xml')">XML</button>
            <button (click)="exportDiagram('png')">PNG</button>
            <button (click)="exportDiagram('svg')">SVG</button>
          </div>

          <button
            class="btn btn-validate"
            (click)="validateDiagram()"
            [disabled]="diagramState.loading">
            Validate
          </button>

          <button
            class="btn btn-back"
            (click)="goBackToProject()">
            Back to Project
          </button>
        </div>
      </div>

      <!-- Error display -->
      <div class="error-banner" *ngIf="diagramState.error">
        <span class="error-message">{{ diagramState.error }}</span>
        <button class="error-close" (click)="clearError()">×</button>
      </div>

      <!-- Auto-save indicator -->
      <div class="auto-save-indicator" [class.active]="autoSaveEnabled">
        <span *ngIf="autoSaveEnabled">Auto-save: ON</span>
        <span *ngIf="!autoSaveEnabled">Auto-save: OFF</span>
      </div>

      <!-- Loading overlay -->
      <div class="loading-overlay" *ngIf="diagramState.loading">
        <div class="loading-spinner"></div>
        <span>Loading diagram...</span>
      </div>

      <!-- Canvas area -->
      <div class="canvas-area" [class.loading]="diagramState.loading">
        <div class="canvas-container" #canvasContainer>
          <!-- This is where your actual diagram canvas would go -->
          <!-- For now, we'll show a placeholder -->
          <div class="canvas-placeholder" *ngIf="currentDiagram">
            <h3>{{ currentDiagram.type.toUpperCase() }} Diagram Canvas</h3>
            <p>Canvas for: {{ currentDiagram.name }}</p>
            <div class="canvas-content" [innerHTML]="diagramContent"></div>

            <!-- Simulated canvas actions -->
            <div class="canvas-tools">
              <button (click)="addElement()">Add Element</button>
              <button (click)="simulateChange()">Simulate Change</button>
              <button (click)="clearCanvas()">Clear Canvas</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation results -->
      <div class="validation-results" *ngIf="validationResults">
        <h4>Validation Results</h4>
        <div class="validation-status" [class.valid]="validationResults.isValid" [class.invalid]="!validationResults.isValid">
          {{ validationResults.isValid ? 'Valid' : 'Invalid' }}
        </div>
        <div class="validation-errors" *ngIf="validationResults.errors.length > 0">
          <h5>Errors:</h5>
          <ul>
            <li *ngFor="let error of validationResults.errors">{{ error }}</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .diagram-canvas {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
    }

    .canvas-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: white;
      border-bottom: 1px solid #ddd;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .diagram-title {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .diagram-type {
      font-size: 0.875rem;
      color: #666;
      font-weight: normal;
    }

    .diagram-meta {
      font-size: 0.75rem;
      color: #666;
      margin-top: 0.25rem;
    }

    .diagram-meta span {
      margin-right: 1rem;
    }

    .canvas-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      position: relative;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn:hover {
      background: #f8f9fa;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-save {
      background: #28a745;
      color: white;
      border-color: #28a745;
    }

    .btn-save.saving {
      background: #6c757d;
      border-color: #6c757d;
    }

    .export-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1000;
    }

    .export-menu button {
      display: block;
      width: 100%;
      padding: 0.5rem 1rem;
      border: none;
      background: white;
      text-align: left;
      cursor: pointer;
    }

    .export-menu button:hover {
      background: #f8f9fa;
    }

    .error-banner {
      background: #dc3545;
      color: white;
      padding: 0.75rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .error-close {
      background: none;
      border: none;
      color: white;
      font-size: 1.25rem;
      cursor: pointer;
    }

    .auto-save-indicator {
      position: fixed;
      top: 100px;
      right: 20px;
      background: #6c757d;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      z-index: 1000;
    }

    .auto-save-indicator.active {
      background: #28a745;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .canvas-area {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    .canvas-container {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .canvas-placeholder {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      background: white;
      margin: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .canvas-tools {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
    }

    .validation-results {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      max-width: 300px;
      z-index: 1000;
    }

    .validation-status.valid {
      color: #28a745;
      font-weight: bold;
    }

    .validation-status.invalid {
      color: #dc3545;
      font-weight: bold;
    }

    .validation-errors {
      margin-top: 0.5rem;
    }

    .validation-errors ul {
      margin: 0.5rem 0 0 0;
      padding-left: 1rem;
    }

    .validation-errors li {
      color: #dc3545;
      font-size: 0.875rem;
    }
  `]
})
export class DiagramCanvasComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  diagramState: DiagramState | null = null;
  currentDiagram: Diagram | null = null;

  // Canvas state
  diagramContent: string = '<p>Canvas content will be rendered here...</p>';
  hasUnsavedChanges: boolean = false;
  isSaving: boolean = false;
  autoSaveEnabled: boolean = true;
  showExportMenu: boolean = false;

  // Validation
  validationResults: { isValid: boolean; errors: string[] } | null = null;

  // Route parameters
  projectId: number | null = null;
  diagramId: number | null = null;
  diagramType: string | null = null;
  diagramTitle: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private diagramManagement: DiagramManagementService
  ) {}

  ngOnInit() {
    // Subscribe to diagram state
    this.diagramManagement.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.diagramState = state;
        this.currentDiagram = state.selectedDiagram;
      });

    // Get route parameters
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.projectId = params['projectId'] ? +params['projectId'] : null;
        this.diagramId = params['diagramId'] ? +params['diagramId'] : null;
        this.diagramType = params['type'];
        this.diagramTitle = params['title'];

        if (this.diagramId) {
          this.loadDiagram(this.diagramId);
        }
      });

    // Setup auto-save
    if (this.autoSaveEnabled) {
      this.setupAutoSave();
    }

    // Close export menu when clicking outside
    document.addEventListener('click', this.closeExportMenu.bind(this));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.closeExportMenu.bind(this));
  }

  // CRUD Operations

  loadDiagram(diagramId: number): void {
    this.diagramManagement.getDiagram(diagramId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (diagram) => {
          this.currentDiagram = diagram;
          if (diagram.content) {
            this.diagramContent = diagram.content;
          }
          this.hasUnsavedChanges = false;
        },
        error: (error) => {
          console.error('Error loading diagram:', error);
        }
      });
  }

  saveDiagram(): void {
    if (!this.currentDiagram || !this.hasUnsavedChanges) {
      return;
    }

    this.isSaving = true;
    this.diagramManagement.updateDiagramContent(this.currentDiagram.id, this.diagramContent)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (diagram) => {
          console.log('Diagram saved successfully');
          this.hasUnsavedChanges = false;
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error saving diagram:', error);
          this.isSaving = false;
        }
      });
  }

  exportDiagram(format: 'json' | 'xml' | 'png' | 'svg'): void {
    if (!this.currentDiagram) {
      return;
    }

    this.diagramManagement.exportDiagram(this.currentDiagram.id, format)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${this.currentDiagram!.name}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error exporting diagram:', error);
        }
      });

    this.showExportMenu = false;
  }

  validateDiagram(): void {
    if (!this.currentDiagram) {
      return;
    }

    this.diagramManagement.validateDiagram(this.currentDiagram.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.validationResults = results;
          // Auto-hide after 5 seconds if valid
          if (results.isValid) {
            timer(5000).pipe(takeUntil(this.destroy$)).subscribe(() => {
              this.validationResults = null;
            });
          }
        },
        error: (error) => {
          console.error('Error validating diagram:', error);
        }
      });
  }

  // Canvas simulation methods

  addElement(): void {
    this.diagramContent += '<div>New Element Added</div>';
    this.hasUnsavedChanges = true;
  }

  simulateChange(): void {
    const timestamp = new Date().toLocaleTimeString();
    this.diagramContent += `<p>Change made at ${timestamp}</p>`;
    this.hasUnsavedChanges = true;
  }

  clearCanvas(): void {
    this.diagramContent = '<p>Canvas cleared</p>';
    this.hasUnsavedChanges = true;
  }

  // Auto-save functionality

  private setupAutoSave(): void {
    // Auto-save every 30 seconds if there are unsaved changes
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.hasUnsavedChanges && !this.isSaving) {
          this.saveDiagram();
        }
      });
  }

  // Utility methods

  goBackToProject(): void {
    if (this.projectId) {
      this.router.navigate(['/dashboard/projects', this.projectId, 'diagrams']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  clearError(): void {
    this.diagramManagement.clearError();
  }

  getDiagramTypeName(type: string): string {
    const typeMap: Record<string, string> = {
      'class': 'Class Diagram',
      'sequence': 'Sequence Diagram',
      'package': 'Package Diagram',
      'usecase': 'Use Case Diagram',
      'component': 'Component Diagram'
    };
    return typeMap[type] || 'Unknown Type';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
  }

  private closeExportMenu(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.btn-export') && !target.closest('.export-menu')) {
      this.showExportMenu = false;
    }
  }
}
