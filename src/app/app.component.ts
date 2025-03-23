import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@infrastructure/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) { }

  async ngOnInit() {
    console.log('AppComponent initialized, rehydrating access token');
    await this.authService.rehydrateAccessToken();
  }
  title = 'UMLForge';
}
