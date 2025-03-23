import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@infrastructure/auth/auth.service';

@Component({
  selector: 'app-google-callback',
  imports: [],
  templateUrl: './google-callback.component.html',
  styleUrl: './google-callback.component.css'
})
export class GoogleCallbackComponent {
  constructor(private authService: AuthService, private router: Router) { }

  async ngOnInit() {
    const success = await this.authService.handleGoogleCallback();
    if (success) {
      console.log('Google login successful, redirecting to dashboard...');
      this.router.navigate(['/dashboard']); // Redirect to a protected route
    } else {
      console.error('Google login failed, redirecting to sign-in...');
      this.router.navigate(['/auth/sign-in']); // Redirect to sign-in page
    }
  }
}
