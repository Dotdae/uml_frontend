import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Category {
  icon: string
  label: string
  color: string
}

@Component({
  selector: 'app-category',
  imports: [CommonModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent {

  categories: Category[] = [
    { icon: "🎯", label: "Para ti", color: "text-blue-500" },
    { icon: "🔄", label: "Ágil", color: "text-blue-500" },
    { icon: "⚙️", label: "Procesos", color: "text-orange-500" },
    { icon: "💡", label: "Lluvia de ideas", color: "text-yellow-500" },
    { icon: "🖥️", label: "Sistemas", color: "text-green-500" },
    { icon: "📅", label: "Planeación", color: "text-red-500" },
    { icon: "🔍", label: "Investigar", color: "text-purple-500" },
  ]

}
