import { Component } from '@angular/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { CategoryComponent } from "./category/category.component";
import { TemplatesComponent } from "./templates/templates.component";
import { RecentComponent } from "./recent/recent.component";

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent, CategoryComponent, TemplatesComponent, RecentComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
