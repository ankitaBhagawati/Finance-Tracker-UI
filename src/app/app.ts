import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
   imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  loginModal = false;

  signInModal() {
    console.log('Modal should open');
    this.loginModal = true;
  }

  closeModal() {
    this.loginModal = false;
  }
}
