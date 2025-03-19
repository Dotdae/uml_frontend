import { Component } from '@angular/core';

interface Document {
  title: string
  image: string
  readOnly?: boolean
}

@Component({
  selector: 'app-recent',
  imports: [],
  templateUrl: './recent.component.html',
  styleUrl: './recent.component.css'
})
export class RecentComponent {

  // Algo así mostraríamos los docs guardados por el usuario.

  recentDocuments: Document[] = [
    {
      title: "Diagrama de flujo",
      image: "https://via.assets.so/img.jpg?height=150&width=200",
    },
    {
      title: "Diagrama de clases UML",
      image: "https://via.assets.so/img.jpg?height=150&width=200",
      readOnly: true,
    },
  ]

}
