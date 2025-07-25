import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SignupModal } from '../signup-modal/signup-modal';

@Component({
  selector: 'app-home',
  imports: [CommonModule, LoginModalComponent, RouterModule, SignupModal],

  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  loginModal = false;
signUpView = false;
  constructor(private readonly router: Router, private toastr: ToastrService) {

  }
openSignUpView() {
  this.loginModal = false;
  this.signUpView = true;
}

closeSignUpModal() {
  this.signUpView = false;
}






  signInModal() {
    this.loginModal = true;
  }

  closeModal(isLogin = false) {
    this.loginModal = false;

    if (isLogin) {
      this.router.navigate(['/dashboard']);
    }
  }
}
