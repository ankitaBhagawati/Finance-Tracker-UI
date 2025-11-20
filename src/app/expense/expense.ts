import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../services/auth.service";
import { environment } from "@env";
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: "app-expense",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./expense.html",
  styleUrls: ["./expense.css"],
})
export class Expense implements OnInit {
  expenseForm!: FormGroup;

  userID = 0;
  expenses: any[] = [];
  categories: any[] = [];

    // Month dropdown list
  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();


  // MODAL STATES
  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;

  deleteTarget: any = null;
  editingId: number | null = null;

  constructor(private http: HttpClient, private authService: AuthService, private toastr: ToastrService) {}

  ngOnInit(): void {
    const user = this.authService.getUserDetails();
    if (user) {
      this.userID = user.id;
    }

 this.expenseForm = new FormGroup({
  title: new FormControl("", Validators.required),
  category_id: new FormControl("", Validators.required),   // <-- correct
  amount: new FormControl("", Validators.required),
  description: new FormControl(""),
});


    this.loadCategories();
    this.loadExpenses();
  }

  loadCategories() {
    this.http.get<any[]>(`${environment.apiUrl}/Category`).subscribe(res => {
     this.categories = res
    .filter(c => c.isActive)
    .map(c => ({
      category_id: c.category_Id,      // normalize
      category_name: c.category_Name
    }));
    });
  }

  loadExpenses() {
    this.http.get<any[]>(`${environment.apiUrl}/Expense?userId=${this.userID}`).subscribe(res => {
      this.expenses = res;
    });
  }

  // =========== OPEN MODALS ===========

  openAdd() {
    this.isAddModalOpen = true;
    this.isEditModalOpen = false;
    this.expenseForm.reset();
  }

openEdit(exp: any) {
  this.isEditModalOpen = true;
  this.isAddModalOpen = false;

  this.editingId = exp.transaction_id;

  this.expenseForm.patchValue({
    title: exp.transaction_name,
    amount: exp.amount,
    description: exp.description,
    category_id: exp.category_id     // <-- correct key + correct value
  });
}


  openDelete(exp: any) {
    this.deleteTarget = exp;
    this.isDeleteModalOpen = true;
  }

  closeModals() {
    this.isAddModalOpen = false;
    this.isEditModalOpen = false;
    this.isDeleteModalOpen = false;
  }

  // =========== SUBMIT ADD ===========
  submitAdd() {
    if (!this.expenseForm.valid) return;

    const body = {
      transaction_name: this.expenseForm.value.title,
      amount: this.expenseForm.value.amount,
      description: this.expenseForm.value.description,
      category_id: this.expenseForm.value.category_Id,
      user_id: this.userID
    };

    this.http.post(`${environment.apiUrl}/Expense`, body).subscribe(() => {
      this.toastr.success('Added successfully');
      this.closeModals();
      this.loadExpenses();
    });
  }

  // =========== SUBMIT UPDATE ===========
  submitUpdate() {
    if (!this.expenseForm.valid || !this.editingId) return;

    const body = {
      transaction_name: this.expenseForm.value.title,
      amount: this.expenseForm.value.amount,
      description: this.expenseForm.value.description,
      category_id: this.expenseForm.value.category_Id
    };

    this.http.put(`${environment.apiUrl}/Expense/${this.editingId}`, body).subscribe(() => {
        this.toastr.success('Updated successfully');
      this.closeModals();
      this.loadExpenses();
    });
  }

  // =========== DELETE ===========
  confirmDelete() {
    if (!this.deleteTarget) return;

    this.http.delete(`${environment.apiUrl}/Expense/${this.deleteTarget.transaction_id}`)
      .subscribe(() => {
        this.toastr.success('Deleted successfully');
        this.closeModals();
        this.loadExpenses();
      });
  }
}
