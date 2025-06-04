export interface Diagram {
  id: number;
  name: string;
  type: number; // 1=CLASS, 2=SEQUENCE, 3=PACKAGE, 4=COMPONENTS, 5=USECASE
  projectId: number;
  infoJson?: string; // JSON string containing diagram data
  version?: number;
  createdAt: string;
  updatedAt: string;
  showOptions?: boolean; // For UI state management
}

export interface CreateDiagramDto {
  name: string;
  type: number; // 1=CLASS, 2=SEQUENCE, 3=PACKAGE, 4=COMPONENTS, 5=USECASE
  idProject: number;
  infoJson: object;
  version?: number;
}

export interface UpdateDiagramDto {
  name?: string;
  type?: number;
  infoJson?: string;
  version?: number;
}

export interface DiagramResponse {
  id: number;
  name: string;
  type: number;
  projectId: number;
  infoJson?: string;
  version?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiagramPaginationResponse {
  diagrams: Diagram[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DiagramSearchFilters {
  query?: string;
  type?: number;
  projectId?: number;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Type mapping constants
export const DIAGRAM_TYPES = {
  CLASS: 1,
  SEQUENCE: 2,
  PACKAGE: 3,
  COMPONENTS: 4,
  USECASE: 5
};

// Helper function to get type name from ID
export function getDiagramTypeName(typeId: number): string {
  switch (typeId) {
    case DIAGRAM_TYPES.CLASS: return 'Class Diagram';
    case DIAGRAM_TYPES.SEQUENCE: return 'Sequence Diagram';
    case DIAGRAM_TYPES.PACKAGE: return 'Package Diagram';
    case DIAGRAM_TYPES.COMPONENTS: return 'Component Diagram';
    case DIAGRAM_TYPES.USECASE: return 'Use Case Diagram';
    default: return 'Unknown Type';
  }
}

// Helper function to get icon path from type ID
export function getDiagramTypeIcon(typeId: number): string {
  switch (typeId) {
    case DIAGRAM_TYPES.CLASS:
      return "M600-160v-80H440v-200h-80v80H80v-240h280v80h80v-200h160v-80h280v240H600v-80h-80v320h80v-80h280v240H600Zm80-80h120v-80H680v80ZM160-440h120v-80H160v80Zm520-200h120v-80H680v80Zm0 400v-80 80ZM280-440v-80 80Zm400-200v-80 80Z";
    case DIAGRAM_TYPES.SEQUENCE:
      return "M296-270q-42 35-87.5 32T129-269q-34-28-46.5-73.5T99-436l75-124q-25-22-39.5-53T120-680q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47q-9 0-18-1t-17-3l-77 130q-11 18-7 35.5t17 28.5q13 11 31 12.5t35-12.5l420-361q42-35 88-31.5t80 31.5q34 28 46 73.5T861-524l-75 124q25 22 39.5 53t14.5 67q0 66-47 113t-113 47q-66 0-113-47t-47-113q0-66 47-113t113-47q9 0 17.5 1t16.5 3l78-130q11-18 7-35.5T782-630q-13-11-31-12.5T716-630L296-270Zm-16-330q33 0 56.5-23.5T360-680q0-33-23.5-56.5T280-760q-33 0-56.5 23.5T200-680q0 33 23.5 56.5T280-600Zm400 400q33 0 56.5-23.5T760-280q0-33-23.5-56.5T680-360q-33 0-56.5 23.5T600-280q0 33 23.5 56.5T680-200ZM280-680Zm400 400Z";
    case DIAGRAM_TYPES.PACKAGE:
      return "M440-183v-274L200-596v274l240 139Zm80 0 240-139v-274L520-457v274Zm-40-343 237-137-237-137-237 137 237 137ZM160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11L160-252Zm320-228Z";
    case DIAGRAM_TYPES.COMPONENTS:
      return "M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z";
    case DIAGRAM_TYPES.USECASE:
      return "M480-720q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720ZM360-80v-520q-60-5-122-15t-118-25l20-80q78 21 166 30.5t174 9.5q86 0 174-9.5T820-720l20 80q-56 15-118 25t-122 15v520h-80v-240h-80v240h-80Z";
    default:
      return "";
  }
}
