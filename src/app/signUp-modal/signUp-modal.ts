import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { environment } from '@env';
import { FormGroup, FormControl, FormsModule,ReactiveFormsModule,Validators, } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signUp-modal',
  templateUrl: './signUp-modal.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styleUrl: './signUp-modal.css'
})
export class SignUpModal {
 @Output() close = new EventEmitter<boolean>();

  closeSignup() {
    this.close.emit(false);
  }
  signUpForm: FormGroup;

  constructor(private readonly http: HttpClient){
    this.signUpForm = new FormGroup({
      name: new FormControl('',[
              Validators.required,
              Validators.minLength(6)
            ]),
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

 onSubmit() {
  if (!this.signUpForm.valid) return;

  this.http
    .post(`${environment.apiUrl}/auth/signUp`, this.signUpForm.value, {
      observe: 'response'
    })
    .subscribe({
      next: (res) => {
        if (res.status === 201) {
          console.log('Sign up successful');
          this.signUpForm.reset();
        }
      },
      error: (err) => {
        if (err.status === 409) {
          console.error('User already exists');
        } else if (err.status === 500) {
          console.error('Server error: ' + err.error);
        } else {
          console.error('Something went wrong: ', err);
        }
      },
    });
}

  }

