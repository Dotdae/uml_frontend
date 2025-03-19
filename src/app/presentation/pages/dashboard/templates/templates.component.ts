import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';


interface Template {
  id: number
  title: string
  image: string
}

@Component({
  selector: 'app-templates',
  imports: [RouterLink],
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.css'
})
export class TemplatesComponent {

  templates: Template[] = [
    {
      id: 1,
      title: "Diagrama de Secuencia",
      image: "https://via.assets.so/img.jpg?height=100&width=100",
    },
    {
      id: 2,
      title: "Diagrama de Clases",
      image: "https://via.assets.so/img.jpg?height=100&width=100",
    },
    {
      id: 3,
      title: "Diagrama de Paquetes",
      image: "https://via.assets.so/img.jpg?height=100&width=100",
    },
    {
      id: 4,
      title: "Diagrama de Casos de Uso",
      image: "https://via.assets.so/img.jpg?height=100&width=100",
    },
    {
      id: 5,
      title: "Diagrama de Componentes",
      image: "https://via.assets.so/img.jpg?height=100&width=100",
    },
  ]

}
