import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { Router, RouterModule } from '@angular/router';
import { SignUpModal } from "../signUp-modal/signUp-modal";

@Component({
  selector: 'app-home',
  imports: [CommonModule, LoginModalComponent, RouterModule, SignUpModal],

  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  loginModal = false;
signUpView = false;
openSignUpView() {
  this.loginModal = false;
  this.signUpView = true;
}

closeSignUpModal() {
  this.signUpView = false;
}

  constructor(private readonly router: Router) {}




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
