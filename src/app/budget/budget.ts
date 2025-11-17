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

  userID = 0;
  userName = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUserDetails();

    if (user) {
      this.userID = user.id;
      this.userName = user.name;
    }

    this.loadAllData();
  }

  loadAllData() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const categories$ = this.http
      .get<any[]>(`${environment.apiUrl}/Category`)
      .pipe(catchError(() => of([])));

    const budgets$ = this.userID
      ? this.http
          .get<any[]>(`${environment.apiUrl}/Budget?userId=${this.userID}`)
          .pipe(catchError(() => of([])))
      : of([]);

    forkJoin({ categories: categories$, budgets: budgets$ }).subscribe(({ categories, budgets }) => {

      this.categories = categories.filter(c => c.isActive);

      const budgetMap = new Map<number, number>();

      (budgets || []).forEach(b => {
        const catId = b.category_id ?? b.categoryId ?? b.CategoryId;
        const amt = Number(b.amount ?? 0);

        if (catId != null) {
          budgetMap.set(catId, amt);
        }
      });

      this.categories.forEach(cat => {
        const id = cat.category_Id;
        this.budgets[id] = budgetMap.get(id) ?? 0;
      });

    });
  }

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

onInput(event: any, catId: number) {
  const el = event.target as HTMLElement;

  // save selection
  const sel = window.getSelection();
  const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
  const oldOffset = range ? range.startOffset : 0;

  const oldValue = el.innerText;
  const newValue = oldValue.replace(/\D+/g, '');

  // update model
  this.budgets[catId] = newValue ? Number(newValue) : 0;

  if (oldValue === newValue) return;

  // update the element text
  el.innerText = newValue;

  // restore caret (clamp to length)
  const pos = Math.min(oldOffset, newValue.length);
  const newRange = document.createRange();
  if (el.firstChild) {
    newRange.setStart(el.firstChild, pos);
  } else {
    newRange.setStart(el, pos);
  }
  newRange.collapse(true);
  sel?.removeAllRanges();
  sel?.addRange(newRange);
}

onFocus(event: any, catId: number) {
  const el = event.target as HTMLElement;
  if (!this.budgets[catId] || this.budgets[catId] === 0) {
    el.innerText = '';
  }
}

onBlur(event: any, catId: number) {
  const el = event.target as HTMLElement;
  const text = (el.innerText || '').trim();
  if (text === '') {
    this.budgets[catId] = 0;
  } else {
    this.budgets[catId] = Number(text.replace(/\D+/g, '')) || 0;
  }
}


  saveBudget(cat: any) {
    const now = new Date();
    const body = {
      budget_id: 0,
      user_id: this.userID,
      user_name: this.userName,
      category_id: cat.category_Id,
      category_name: cat.category_Name,
      amount: this.budgets[cat.category_Id],
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      isActive: true
    };

    this.http
      .post(`${environment.apiUrl}/Budget`, body)
      .subscribe({
        next: () => {
          console.log('Budget saved:', body);
          this.loadAllData();
        },
        error: (err) => console.error(err)
      });
  }
}
