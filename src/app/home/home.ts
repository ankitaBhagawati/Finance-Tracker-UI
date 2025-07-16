import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, LoginModalComponent, RouterModule],

  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  loginModal = false;

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
