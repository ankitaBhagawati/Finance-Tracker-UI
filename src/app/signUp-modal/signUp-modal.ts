import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { environment } from '@env';
import { FormGroup, FormControl, FormsModule,ReactiveFormsModule,Validators, } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup-modal',
  templateUrl: './signup-modal.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styleUrl: './signup-modal.css'
})
export class SignupModal {
 @Output() close = new EventEmitter<boolean>();
 @Output() signInModal = new EventEmitter<void>();

  signUpForm: FormGroup;



  constructor(private readonly http: HttpClient, private toastr: ToastrService){
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

      closeSignup() {
    this.close.emit(false);
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
          this.toastr.success('Sign up successful')
          this.signInModal.emit()
          this.signUpForm.reset();
        }
      },
      error: (err) => {
        if (err.status === 409) {
        } else if (err.status === 500) {
          this.toastr.error('Server error: ' + err.error);

        } else {
          this.toastr.error('Something went wrong: ', err);
        }
      },
    });
}

  }

