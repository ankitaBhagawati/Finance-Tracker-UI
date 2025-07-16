import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginModalComponent } from './login-modal/login-modal.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, LoginModalComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  loginModal = false;

  signInModal() {
    this.loginModal = true;
  }

  closeModal() {
    this.loginModal = false;
  }
}
