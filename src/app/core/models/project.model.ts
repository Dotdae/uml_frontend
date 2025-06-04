export interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface Status {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Diagram {
  id: number;
  name: string;
  type: number; // 1=CLASS, 2=SEQUENCE, 3=PACKAGE, 4=COMPONENTS, 5=USECASE
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  userUUID: string | null;
  projectName: string;
  generatedCounter: number;
  statusId: number | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  status?: Status;
  diagrams?: Diagram[];
  showOptions?: boolean; // For UI state management
}

export interface CreateProjectDto {
  userUUID: string;
  projectName: string;
  statusId?: number;
  generatedCounter?: number;
}

export interface UpdateProjectDto {
  userUUID?: string;
  projectName?: string;
  statusId?: number;
  generatedCounter?: number;
}

export interface TrashBin {
  id: number;
  projectId: number | null;
  diagramId: number | null;
  deletedBy: string;
  deletedAt: string;
  project?: Project;
  diagram?: Diagram;
  user?: User;
}

export interface CreateTrashBinDto {
  projectId?: number;
  diagramId?: number;
  deletedBy: string;
}
