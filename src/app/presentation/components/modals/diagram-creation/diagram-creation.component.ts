import { Component, EventEmitter, Input, Output } from '@angular/core';
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
}

@Component({
  selector: 'app-diagram-creation',
  imports: [CommonModule, FormsModule],
  templateUrl: './diagram-creation.component.html',
  styleUrl: './diagram-creation.component.css'
})
export class DiagramCreationComponent {
  @Input() projectId: number | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<DiagramCreationData>();

  currentStep: 1 | 2 = 1; // Paso actual: 1 = nombre, 2 = tipo
  diagramName: string = '';
  selectedType: number | null = null;
  errorMessage: string = '';

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

  nextStep(): void {
    if (this.currentStep === 1) {
      if (this.isValidName()) {
        this.currentStep = 2;
        this.errorMessage = '';
      } else {
        this.errorMessage = 'Por favor, ingresa un nombre válido para el diagrama.';
      }
    }
  }

  previousStep(): void {
    if (this.currentStep === 2) {
      this.currentStep = 1;
    }
  }

  selectType(type: number): void {
    this.selectedType = type;
  }

  createDiagram(): void {
    if (this.isValidName() && this.selectedType) {
      this.create.emit({
        name: this.diagramName.trim(),
        type: this.selectedType
      });
    } else if (!this.isValidName()) {
      this.errorMessage = 'Por favor, ingresa un nombre válido para el diagrama.';
      this.currentStep = 1;
    } else {
      this.errorMessage = 'Por favor, selecciona un tipo de diagrama.';
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  isValidName(): boolean {
    return this.diagramName.trim().length > 0;
  }

  getDiagramTypeName(type: number): string {
    const diagramType = this.diagramTypes.find(dt => dt.type === type);
    return diagramType ? diagramType.label : 'Tipo desconocido';
  }

  // Limpiar el mensaje de error cuando el usuario escribe
  onDiagramNameInput(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }
}
