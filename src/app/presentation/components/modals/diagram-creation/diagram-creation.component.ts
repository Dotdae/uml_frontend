import { Component, EventEmitter, Input, Output, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DIAGRAM_TYPES, getDiagramTypeName, getDiagramTypeIcon } from 'src/app/core/models/diagram.model';

export interface DiagramCreationData {
  name: string;
  type: number; // 1=CLASS, 2=SEQUENCE, 3=PACKAGE, 4=COMPONENTS, 5=USECASE
}

interface DiagramType {
  type: number;
  label: string;
  description: string;
  icon: string;
  disabled?: boolean; // Add disabled property
}

@Component({
  selector: 'app-diagram-creation',
  imports: [CommonModule, FormsModule],
  templateUrl: './diagram-creation.component.html',
  styleUrl: './diagram-creation.component.css'
})
export class DiagramCreationComponent implements OnInit, OnChanges, OnDestroy {
  @Input() projectId: number | null = null;
  @Input() existingDiagramTypes: number[] = []; // Array of existing diagram types in project
  @Input() errorMessage: string = ''; // Error message from parent
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<DiagramCreationData>();

  currentStep: 1 | 2 = 1; // Paso actual: 1 = nombre, 2 = tipo
  diagramName: string = '';
  selectedType: number | null = null;
  localErrorMessage: string = '';

  // Types that are restricted to 1 per project
  private readonly RESTRICTED_TYPES = [DIAGRAM_TYPES.CLASS, DIAGRAM_TYPES.PACKAGE, DIAGRAM_TYPES.COMPONENTS, DIAGRAM_TYPES.USECASE];

  // Lista de tipos de diagramas disponibles
  diagramTypes: DiagramType[] = [
    {
      type: DIAGRAM_TYPES.CLASS,
      label: "Diagrama de Clases",
      description: "Representa la estructura estática de un sistema mostrando clases, atributos, métodos y relaciones entre ellas.",
      icon: getDiagramTypeIcon(DIAGRAM_TYPES.CLASS)
    },
    {
      type: DIAGRAM_TYPES.SEQUENCE,
      label: "Diagrama de Secuencia",
      description: "Muestra la interacción entre objetos a lo largo del tiempo, enfatizando el orden de los mensajes intercambiados.",
      icon: getDiagramTypeIcon(DIAGRAM_TYPES.SEQUENCE)
    },
    {
      type: DIAGRAM_TYPES.PACKAGE,
      label: "Diagrama de Paquetes",
      description: "Organiza elementos relacionados en grupos lógicos para visualizar la estructura y dependencias del sistema.",
      icon: getDiagramTypeIcon(DIAGRAM_TYPES.PACKAGE)
    },
    {
      type: DIAGRAM_TYPES.USECASE,
      label: "Diagrama de Casos de Uso",
      description: "Representa la funcionalidad del sistema desde la perspectiva del usuario, mostrando actores y casos de uso.",
      icon: getDiagramTypeIcon(DIAGRAM_TYPES.USECASE)
    },
    {
      type: DIAGRAM_TYPES.COMPONENTS,
      label: "Diagrama de Componentes",
      description: "Muestra la estructura física de un sistema en términos de componentes, interfaces y sus dependencias.",
      icon: getDiagramTypeIcon(DIAGRAM_TYPES.COMPONENTS)
    }
  ];

  ngOnInit() {
    this.updateDiagramTypesAvailability();
    this.disableBodyScroll();
  }

  ngOnChanges() {
    this.updateDiagramTypesAvailability();
  }

  ngOnDestroy() {
    this.enableBodyScroll();
  }

  private disableBodyScroll(): void {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = this.getScrollbarWidth() + 'px';
  }

  private enableBodyScroll(): void {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  private getScrollbarWidth(): number {
    // Create a temporary div to measure scrollbar width
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    (outer.style as any).msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode?.removeChild(outer);

    return scrollbarWidth;
  }

  private updateDiagramTypesAvailability() {
    this.diagramTypes = this.diagramTypes.map(type => ({
      ...type,
      disabled: this.RESTRICTED_TYPES.includes(type.type) && this.existingDiagramTypes.includes(type.type)
    }));
  }

  isValidName(): boolean {
    return this.diagramName.trim().length >= 3;
  }

  selectType(type: number): void {
    const diagramType = this.diagramTypes.find(dt => dt.type === type);
    if (diagramType?.disabled) {
      this.localErrorMessage = `Ya existe un diagrama de tipo "${diagramType.label}" en este proyecto. Solo se permite uno por proyecto.`;
      return;
    }

    this.selectedType = type;
    this.localErrorMessage = '';
  }

  nextStep(): void {
    if (this.isValidName()) {
      this.currentStep = 2;
      this.localErrorMessage = '';
    } else {
      this.localErrorMessage = 'Por favor, ingresa un nombre válido para el diagrama (mínimo 3 caracteres).';
    }
  }

  previousStep(): void {
    this.currentStep = 1;
    this.localErrorMessage = '';
  }

  createDiagram(): void {
    const selectedDiagramType = this.diagramTypes.find(dt => dt.type === this.selectedType);

    if (selectedDiagramType?.disabled) {
      this.localErrorMessage = `Ya existe un diagrama de tipo "${selectedDiagramType.label}" en este proyecto.`;
      return;
    }

    if (this.isValidName() && this.selectedType) {
      this.create.emit({
        name: this.diagramName.trim(),
        type: this.selectedType
      });
    } else if (!this.isValidName()) {
      this.localErrorMessage = 'Por favor, ingresa un nombre válido para el diagrama.';
      this.currentStep = 1;
    } else {
      this.localErrorMessage = 'Por favor, selecciona un tipo de diagrama.';
    }
  }

  closeModal(): void {
    this.enableBodyScroll();
    this.close.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.currentStep = 1;
    this.diagramName = '';
    this.selectedType = null;
    this.localErrorMessage = '';
  }

  // Helper method to get the effective error message
  getEffectiveErrorMessage(): string {
    return this.errorMessage || this.localErrorMessage;
  }

  // Helper method to check if selected type is disabled
  isSelectedTypeDisabled(): boolean {
    if (!this.selectedType) return false;
    const selectedDiagramType = this.diagramTypes.find(dt => dt.type === this.selectedType);
    return selectedDiagramType?.disabled || false;
  }

  getDiagramTypeName(type: number): string {
    const diagramType = this.diagramTypes.find(dt => dt.type === type);
    return diagramType ? diagramType.label : 'Tipo desconocido';
  }
}
