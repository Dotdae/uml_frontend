import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DiagramService } from 'src/app/core/services/diagram.service';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  projectCount: number = 0;
  diagramCount: number = 0;

  constructor(private readonly projectsService: ProjectsService, private readonly diagramService: DiagramService) {}

  ngOnInit() {
    this.projectsService.getProjectCount().subscribe({
      next: (count) => {
        this.projectCount = count;
      },
      error: (error) => {
        console.error('Error fetching project count:', error);
      }
    });

    this.diagramService.getDiagramCount().subscribe({
      next: (response) => {
        console.log('Diagram count:', response);
        this.diagramCount = response.count!;
      },
    });
  }
}
