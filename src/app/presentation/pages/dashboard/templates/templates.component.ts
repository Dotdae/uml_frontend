import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';


interface Template {
  type: string
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
      type: "sequence",
      title: "Diagrama de Secuencia",
      image: "https://via.assets.so/img.jpg?height=100&width=100",
    },
    {
      type: "class",
      title: "Diagrama de Clases",
      image: "https://via.assets.so/img.jpg?height=100&width=100",
    },
    {
      type: "package",
      title: "Diagrama de Paquetes",
      image: "https://via.assets.so/img.jpg?height=100&width=100",
    },
    {
      type: "usecase",
      title: "Diagrama de Casos de Uso",
      image: "https://via.assets.so/img.jpg?height=100&width=100",
    },
    {
      type: "component",
      title: "Diagrama de Componentes",
      image: "https://via.assets.so/img.jpg?height=100&width=100",
    },
    // {
    //   type: "blank",
    //   title: "Lienzo en Blanco",
    //   image: "https://via.assets.so/img.jpg?height=100&width=100",
    // },
  ]

}
