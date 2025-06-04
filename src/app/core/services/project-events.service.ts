import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Project } from '../models/project.model';

export interface ProjectEvent {
  type: 'created' | 'updated' | 'deleted' | 'moved-to-trash';
  project: Project;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectEventsService {
  private projectEventsSubject = new Subject<ProjectEvent>();

  constructor() { }

  /**
   * Emit a project event
   */
  emitProjectEvent(event: ProjectEvent): void {
    this.projectEventsSubject.next(event);
  }

  /**
   * Subscribe to project events
   */
  getProjectEvents(): Observable<ProjectEvent> {
    return this.projectEventsSubject.asObservable();
  }

  /**
   * Emit project created event
   */
  projectCreated(project: Project): void {
    this.emitProjectEvent({ type: 'created', project });
  }

  /**
   * Emit project updated event
   */
  projectUpdated(project: Project): void {
    this.emitProjectEvent({ type: 'updated', project });
  }

  /**
   * Emit project deleted event
   */
  projectDeleted(project: Project): void {
    this.emitProjectEvent({ type: 'deleted', project });
  }

  /**
   * Emit project moved to trash event
   */
  projectMovedToTrash(project: Project): void {
    this.emitProjectEvent({ type: 'moved-to-trash', project });
  }
}
