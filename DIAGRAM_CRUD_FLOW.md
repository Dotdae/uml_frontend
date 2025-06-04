# UML Frontend Diagram CRUD Flow Documentation

This document explains the complete CRUD (Create, Read, Update, Delete) flow for diagrams in the UML Frontend application.

## Table of Contents
1. [Database Schema](#database-schema)
2. [Data Model](#data-model)
3. [Service Layer](#service-layer)
4. [Component Layer](#component-layer)
5. [Flow Examples](#flow-examples)
6. [Mock Data System](#mock-data-system)

## Database Schema

The diagrams are stored in the database with the following schema:

| Field     | Type    | Description                                   |
|-----------|---------|-----------------------------------------------|
| ID        | Number  | Primary key                                   |
| PROJECTID | Number  | Foreign key to the projects table             |
| INFOJSON  | String  | JSON string containing diagram data           |
| TYPE      | Number  | Diagram type ID (1-5)                         |
| VERSION   | Number  | Version number for tracking changes           |
| NAME      | String  | Diagram name                                  |

### Diagram Types
The diagram types are stored in a separate table:

| ID | NAME      |
|----|-----------|
| 1  | CLASS     |
| 2  | SEQUENCE  |
| 3  | PACKAGE   |
| 4  | COMPONENTS|
| 5  | USECASE   |

## Data Model

The TypeScript interfaces that represent the diagram data model are defined in `src/app/core/models/diagram.model.ts`:

```typescript
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
  type: number;
  projectId: number;
  infoJson?: string;
  version?: number;
}

export interface UpdateDiagramDto {
  name?: string;
  type?: number;
  infoJson?: string;
  version?: number;
}
```

The model also includes helper constants and functions:

```typescript
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
  // Implementation...
}

// Helper function to get icon path from type ID
export function getDiagramTypeIcon(typeId: number): string {
  // Implementation...
}
```

## Service Layer

The application uses a layered service architecture:

### 1. DiagramService

Located in `src/app/core/services/diagram.service.ts`, this service handles direct API communication:

- **API Endpoints**: Communicates with backend REST endpoints
- **Mock Data**: Provides mock implementation for development
- **CRUD Operations**:
  - `getDiagrams()`: Get all diagrams with filtering options
  - `getDiagramsByProject()`: Get diagrams for a specific project
  - `getDiagram()`: Get a specific diagram by ID
  - `createDiagram()`: Create a new diagram
  - `updateDiagram()`: Update an existing diagram
  - `updateDiagramContent()`: Update diagram content specifically
  - `renameDiagram()`: Rename a diagram
  - `deleteDiagram()`: Hard delete a diagram
  - `moveDiagramToTrash()`: Soft delete a diagram
  - `duplicateDiagram()`: Create a copy of a diagram

### 2. DiagramManagementService

Located in `src/app/core/services/diagram-management.service.ts`, this higher-level service:

- **State Management**: Uses BehaviorSubject to maintain application state
- **Caching**: Implements caching with timestamps for better performance
- **Business Logic**: Handles complex operations and state updates
- **Auto-Save**: Provides auto-save functionality for diagram editing

Key features:
- Reactive programming with Observables
- Intelligent cache invalidation
- Error handling and reporting
- Auto-save with configurable intervals

### 3. DiagramCanvasService

Located in `src/app/core/services/diagram-canvas.service.ts`, this specialized service:

- **Canvas Operations**: Handles diagram editing operations
- **Element Management**: Add, update, remove elements and connections
- **Template Generation**: Creates starter templates based on diagram type
- **Auto-Save Integration**: Works with DiagramManagementService for auto-saving

## Component Layer

The UI components that implement the CRUD interface:

### 1. ProjectDiagramsComponent

Located in `src/app/presentation/pages/dashboard/project-diagrams/project-diagrams.component.ts`:

- Displays a list of diagrams for a project
- Provides filtering, sorting, and pagination
- Implements diagram operations (create, rename, delete, etc.)

### 2. DiagramCreationComponent

Located in `src/app/presentation/components/modals/diagram-creation/diagram-creation.component.ts`:

- Two-step wizard for creating new diagrams
- Step 1: Enter diagram name
- Step 2: Select diagram type from available options

### 3. DiagramCanvasComponent (not shown in the code)

This component would handle the actual diagram editing interface:

- Renders the diagram canvas based on diagram type
- Provides tools for adding, editing, and connecting elements
- Implements auto-save functionality

## Flow Examples

### Create Diagram Flow

1. User clicks "Create new diagram" button in ProjectDiagramsComponent
2. DiagramCreationComponent modal opens
3. User enters diagram name and selects type
4. DiagramCreationComponent emits create event with DiagramCreationData
5. ProjectDiagramsComponent calls DiagramService.createDiagram()
6. DiagramService sends API request (or uses mock data)
7. New diagram is added to the list and cache is updated

### Edit Diagram Flow

1. User clicks on a diagram in the list
2. Application navigates to DiagramCanvasComponent with diagram ID
3. DiagramCanvasComponent loads diagram via DiagramManagementService
4. User edits the diagram
5. Changes are auto-saved via DiagramCanvasService
6. DiagramCanvasService calls DiagramManagementService.updateDiagramContent()
7. DiagramManagementService updates cache and calls DiagramService
8. DiagramService sends API request (or updates mock data)

## Mock Data System

The application includes a mock data system for development without a backend:

1. Set `useMockData = true` in DiagramService to use mock data
2. Mock diagrams are stored in memory with realistic sample data
3. CRUD operations are simulated with appropriate delays
4. When ready for production, set `useMockData = false` to use real API

### Sample Mock Diagram

```typescript
{
  id: 1,
  name: 'User Management Class Diagram',
  type: DIAGRAM_TYPES.CLASS,
  projectId: 1,
  infoJson: JSON.stringify({
    elements: [
      { id: 'e1', type: 'class', name: 'User', attributes: ['id: number', 'name: string', 'email: string'] },
      { id: 'e2', type: 'class', name: 'Role', attributes: ['id: number', 'name: string'] }
    ],
    connections: [
      { id: 'c1', from: 'e1', to: 'e2', type: 'association' }
    ]
  }),
  version: 1,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T15:30:00Z',
  showOptions: false
}
```

## Best Practices Implemented

1. **Layered Architecture**: Clear separation of concerns between services
2. **TypeScript Type Safety**: Comprehensive interfaces and type checking
3. **Reactive Programming**: Using RxJS for state management and async operations
4. **Caching Strategy**: Efficient caching with timestamp-based invalidation
5. **Error Handling**: Comprehensive error handling and reporting
6. **Auto-Save**: Background saving to prevent data loss
7. **Mock Data**: Development-ready mock implementation
