import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// import { VerifyAccountUseCase } from '@application/usecases/user/verify-account.usecase';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-user',
  imports: [],
  templateUrl: './verify-user.component.html',
  styleUrl: './verify-user.component.css'
})
export class VerifyUserComponent {
  VerificationError: boolean = false;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    // private verifyAccountUseCase: VerifyAccountUseCase
  ){ }

  // ngOnInit() {
  //   const token = this.route.snapshot.params['token'];
  //   if (token) {
  //     this.verifyAccountUseCase.execute(token).subscribe({
  //       next: () => {
  //         this.VerificationError = false;
  //       },
  //       error: (error) => {
  //         console.error('Error verifying account:', error);
  //         this.VerificationError = true;
  //       }
  //     });
  //   } else {
  //     this.VerificationError = true;
  //   }
  // }

  goBackToLog(){
    this.router.navigate(['/auth'])
  }
}
