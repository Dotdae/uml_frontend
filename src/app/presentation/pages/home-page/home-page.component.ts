import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

  @ViewChild('carousel') carousel!: ElementRef;

  selectedIndex: number | null = null;


  cards = [
    { title: "Diagramas de Secuencia UI", img: "https://www.ionos.mx/digitalguide/fileadmin/DigitalGuide/Screenshots_2019/Sequenzdiagramme-ES-6.png", description: "Description", points: ["Dot text", "Dot text", "Dot text"] },
    { title: "Diagramas de Clases UI", img: "https://landing.moqups.com/img/templates/diagrams/uml-class-diagram.png", description: "Description", points: ["Dot text", "Dot text", "Dot text"] },
    { title: "Diagramas de Paquetes UI", img: "https://sparxsystems.com/images/screenshots/uml2_tutorial/pd01.gif", description: "Description", points: ["Dot text", "Dot text", "Dot text"] },
    { title: "Diagramas de Casos de Uso UI", img: "https://landing.moqups.com/img/templates/diagrams/uml-use-case-diagram.png", description: "Description", points: ["Dot text", "Dot text", "Dot text"] },
    { title: "Diagramas de Componentes UI", img: "https://lh4.googleusercontent.com/proxy/rnjXusGmmsYSQNlmO2ppbI28Yvs15hDRJCu0rQGguAnloTKaKKJ9NJP1-pWo3uccHGUwjIzpf-Ksw3tEy0fZXNWrqMcQfIx51dnK77S52Xabp63kNn58Og", description: "Description", points: ["Dot text", "Dot text", "Dot text"] },
  ];

  focusCard(index: number){

    this.selectedIndex = index;

    // Desplazar la tarjeta seleccionada al centro
    const cardElements = this.carousel.nativeElement.children;
    const selectedCard = cardElements[index] as HTMLElement;


    this.carousel.nativeElement.scrollTo({
      left: selectedCard.offsetLeft - this.carousel.nativeElement.offsetWidth / 2 + selectedCard.offsetWidth / 2,
      behavior: 'smooth'
    })


  }

}
