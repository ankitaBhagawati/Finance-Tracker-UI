import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@env';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget.html',
  styleUrls: ['./budget.css']
})
export class Budget implements OnInit {

  categories: any[] = [];
  budgets: Record<number, number> = {};

  loading = false;

  userID = 0;
  userName = '';

  // Month dropdown list
  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUserDetails();
    if (user) {
      this.userID = user.id;
      this.userName = user.name;
    }

    this.loadAllData();
  }

  onMonthChange(value: string) {
    this.selectedMonth = Number(value);
    this.loadAllData();
  }

  /** LOAD CATEGORIES + BUDGETS */
  loadAllData() {
    this.loading = true;

    const categories$ = this.http
      .get<any[]>(`${environment.apiUrl}/Category`)
      .pipe(catchError(() => of([])));

    const budgets$ = this.http
      .get<any[]>(`${environment.apiUrl}/Budget?userId=${this.userID}`)
      .pipe(catchError(() => of([])));

    forkJoin({ categories: categories$, budgets: budgets$ }).subscribe(({ categories, budgets }) => {
      this.loading = false;

      // Filter active categories
      this.categories = categories.filter(c => c.isActive !== false);

      // Create map for selected month budgets
      const budgetMap = new Map<number, number>();
      (budgets || []).forEach(b => {
        if (b.month === this.selectedMonth && b.year === this.selectedYear) {
          budgetMap.set(b.category_id, Number(b.amount));
        }
      });

      // Sync budgets to UI
      this.categories.forEach(cat => {
        const id = cat.category_Id;
        this.budgets[id] = budgetMap.get(id) ?? 0;
      });
    });
  }

  /** BLOCK NON NUMBERS + SAVE ON ENTER */
  onKeyDown(event: KeyboardEvent, cat: any) {
    if (event.key.length === 1 && !/^\d$/.test(event.key)) {
      event.preventDefault();
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      (event.target as HTMLElement).blur();
      this.saveBudget(cat);
    }
  }

  /** PRESERVE CARET POSITION + CLEAN NON NUMBERS */
  onInput(event: any, catId: number) {
    const el = event.target as HTMLElement;

    const sel = window.getSelection();
    const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
    const oldOffset = range ? range.startOffset : 0;

    const oldValue = el.innerText;
    const newValue = oldValue.replace(/\D+/g, '');

    this.budgets[catId] = newValue ? Number(newValue) : 0;

    if (oldValue === newValue) return;

    el.innerText = newValue;

    const pos = Math.min(oldOffset, newValue.length);
    const newRange = document.createRange();
    if (el.firstChild) newRange.setStart(el.firstChild, pos);
    else newRange.setStart(el, pos);
    newRange.collapse(true);

    sel?.removeAllRanges();
    sel?.addRange(newRange);
  }

  /** EMPTY FIELD ON FOCUS IF BUDGET = 0 */
  onFocus(event: any, id: number) {
    const el = event.target as HTMLElement;
    if (this.budgets[id] === 0) el.innerText = '';
  }

  /** RESTORE 0 WHEN BLUR + EMPTY */
  onBlur(event: any, id: number) {
    const el = event.target as HTMLElement;
    const text = el.innerText.trim();

    if (text === '') {
      this.budgets[id] = 0;
      el.innerText = '';
    }
  }

  /** SAVE TO API */
  saveBudget(cat: any) {
    const body = {
      budget_id: 0,
      user_id: this.userID,
      user_name: this.userName,
      category_id: cat.category_Id,
      category_name: cat.category_Name,
      amount: this.budgets[cat.category_Id],
      month: this.selectedMonth,
      year: this.selectedYear,
      isActive: true
    };

    this.http.post(`${environment.apiUrl}/Budget`, body).subscribe(() => {
      this.loadAllData();
    });
  }
}
