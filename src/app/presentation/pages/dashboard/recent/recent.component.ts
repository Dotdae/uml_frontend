import { Component } from '@angular/core';

interface Document {
  title: string;
  image: string;
  readOnly?: boolean;
  projectUrl?: string; // Nueva propiedad para el enlace al proyecto
}

@Component({
  selector: 'app-recent',
  imports: [],
  templateUrl: './recent.component.html',
  styleUrl: './recent.component.css'
})
export class RecentComponent {

  // Documentos recientes con enlace al proyecto si existe
  recentDocuments: Document[] = [
    {
      title: "Diagrama de flujo",
      image: "https://via.assets.so/img.jpg?height=150&width=200",
      projectUrl: "http://localhost:4200/proyectos/diagrama-flujo"
    },
    {
      title: "Diagrama de clases UML",
      image: "https://via.assets.so/img.jpg?height=150&width=200",
      readOnly: true,
      projectUrl: "http://localhost:4200/proyectos/uml-clases"
    },
    {
      title: "Proyecto sin enlace",
      image: "https://via.assets.so/img.jpg?height=150&width=200"
      // Sin projectUrl, no se muestra el botón
    }
  ];

}
