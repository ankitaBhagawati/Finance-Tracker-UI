import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.css'
})
export class LoginModalComponent {
  @Input({ required: true }) loginModal = false;
  @Output()
  closeModal = new EventEmitter<void>();

  onCloseModal() {
    this.closeModal.emit();
  }
}
