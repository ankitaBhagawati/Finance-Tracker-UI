import { CommonModule } from '@angular/common';
import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { environment } from '@env';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.css',
})
export class LoginModalComponent {
  @Input({ required: true }) loginModal = false;
  @Output()
  closeModal = new EventEmitter<boolean>();

  loginForm: FormGroup;

  constructor(private readonly http: HttpClient) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.email,
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  onCloseModal() {
    this.closeModal.emit(false);
  }

  onSubmit() {
    if (!this.loginForm.valid) return;

    this.http
      .post(`${environment.apiUrl}/auth/signin`, this.loginForm.value, {
        observe: 'response'
      })
      .subscribe({
        next: (res) => {
          const token = res.headers.get('Authorization');
          if (!token || token.length === 0) {
            console.error('Invalid login. You suck');
            return;
          }

          localStorage.setItem('finance_token', token.substring(7))
          this.closeModal.emit(true);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
}
