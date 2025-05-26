import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Document {
  title: string;
  image: string;
  readOnly?: boolean;
  projectUrl?: string;
}

@Component({
  selector: 'app-recent',
  imports: [],
  templateUrl: './recent.component.html',
  styleUrl: './recent.component.css'
})
export class RecentComponent implements OnInit {

  recentDocuments: Document[] = [];

  // Aquí va el id del usuario que se está autenticando
  userId: string = "3d22590b-5062-4a33-b627-2798ac6adb87";

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchRecentDocuments();
  }

  fetchRecentDocuments() {
    this.http.get<any[]>(`http://localhost:3000/api/proyects/user/${this.userId}`)
      .subscribe({
        next: (projects) => {
          this.recentDocuments = projects.map(proj => ({
            title: proj.name,
            image: proj.image || "https://via.assets.so/img.jpg?height=150&width=200",
            readOnly: proj.readOnly || false,
            projectUrl: proj.projectUrl || `http://localhost:4200/proyectos/${proj.id}`
          }));
        },
        error: (err) => {
          console.error('Error al cargar proyectos recientes', err);
        }
      });
  }
}
