import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DiagramCreationData {
  name: string;
  type: string;
}

interface DiagramType {
  type: string;
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
  selectedType: string = '';
  errorMessage: string = '';
  
  // Lista de tipos de diagramas disponibles
  diagramTypes: DiagramType[] = [
    { 
      type: "class", 
      label: "Diagrama de Clases", 
      description: "Representa la estructura estática de un sistema mostrando clases, atributos, métodos y relaciones entre ellas.",
      icon: "M600-160v-80H440v-200h-80v80H80v-240h280v80h80v-200h160v-80h280v240H600v-80h-80v320h80v-80h280v240H600Zm80-80h120v-80H680v80ZM160-440h120v-80H160v80Zm520-200h120v-80H680v80Zm0 400v-80 80ZM280-440v-80 80Zm400-200v-80 80Z"
    },
    { 
      type: "sequence", 
      label: "Diagrama de Secuencia", 
      description: "Muestra la interacción entre objetos a lo largo del tiempo, enfatizando el orden de los mensajes intercambiados.",
      icon: "M296-270q-42 35-87.5 32T129-269q-34-28-46.5-73.5T99-436l75-124q-25-22-39.5-53T120-680q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47q-9 0-18-1t-17-3l-77 130q-11 18-7 35.5t17 28.5q13 11 31 12.5t35-12.5l420-361q42-35 88-31.5t80 31.5q34 28 46 73.5T861-524l-75 124q25 22 39.5 53t14.5 67q0 66-47 113t-113 47q-66 0-113-47t-47-113q0-66 47-113t113-47q9 0 17.5 1t16.5 3l78-130q11-18 7-35.5T782-630q-13-11-31-12.5T716-630L296-270Zm-16-330q33 0 56.5-23.5T360-680q0-33-23.5-56.5T280-760q-33 0-56.5 23.5T200-680q0 33 23.5 56.5T280-600Zm400 400q33 0 56.5-23.5T760-280q0-33-23.5-56.5T680-360q-33 0-56.5 23.5T600-280q0 33 23.5 56.5T680-200ZM280-680Zm400 400Z"
    },
    { 
      type: "package", 
      label: "Diagrama de Paquetes", 
      description: "Organiza elementos relacionados en grupos lógicos para visualizar la estructura y dependencias del sistema.",
      icon: "M440-183v-274L200-596v274l240 139Zm80 0 240-139v-274L520-457v274Zm-40-343 237-137-237-137-237 137 237 137ZM160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11L160-252Zm320-228Z"
    },
    { 
      type: "usecase", 
      label: "Diagrama de Casos de Uso", 
      description: "Representa la funcionalidad del sistema desde la perspectiva del usuario, mostrando actores y casos de uso.",
      icon: "M480-720q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720ZM360-80v-520q-60-5-122-15t-118-25l20-80q78 21 166 30.5t174 9.5q86 0 174-9.5T820-720l20 80q-56 15-118 25t-122 15v520h-80v-240h-80v240h-80Z"
    },
    { 
      type: "component", 
      label: "Diagrama de Componentes", 
      description: "Muestra la estructura física de un sistema en términos de componentes, interfaces y sus dependencias.",
      icon: "M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z"
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
  
  selectType(type: string): void {
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
  
  getDiagramTypeName(type: string): string {
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