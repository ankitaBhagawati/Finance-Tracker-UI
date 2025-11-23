import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@env';
import { AuthService } from '../services/auth.service';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import { AccumulationChartModule, AccumulationLegendService, AccumulationTooltipService, AccumulationDataLabelService } from '@syncfusion/ej2-angular-charts';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

/* ------------------------- Expense Bar Interface ------------------------- */
interface ExpenseBar {
  categoryName: string;
  budget: number;
  spent: number;
  percent: number;             // capped 0–100 for UI bar width
  percentExact: number;        // actual raw percent spent
  fillWidth: number;           // width for the gradient bar
  over: boolean;               // if spent > budget
  displayPercentText: string;  // “105%”
}

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule, AccumulationChartModule],
  providers: [ AccumulationLegendService, AccumulationTooltipService, AccumulationDataLabelService ],
  templateUrl: './budget.html',
  styleUrls: ['./budget.css']
})
export class Budget implements OnInit, AfterViewInit {

  @ViewChild('cardsContainer') cardsContainer!: ElementRef<HTMLElement>;

  /* ------------------------- Charts & data ------------------------- */
  budgetChart: any;
  expenses: any[] = [];
  categories: any[] = [];
  canScrollLeft = false;
  canScrollRight = false;
  budgets: Record<number, number> = {};
  budgetRecordMap: Record<number, any> = {};

  /* ------------------------- Expense bars ------------------------- */
  expenseBars: ExpenseBar[] = [];

  /* -------------------- Category icons --------------------- */
  getIcon(name: string) {
    switch (name?.toLowerCase()) {
      case 'food': return '🍽️';
      case 'rent': return '🏠';
      case 'bills': return '💡';
      case 'commute': return '🚗';
      case 'gym': return '🏋️';
      default: return '📦';
    }
  }

  loading = false;

  /* ------------------------- User ------------------------- */
  userID = 0;
  userName = '';

  /* ------------------------- Month selection ------------------------- */
  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' },   { value: 5, label: 'May' },      { value: 6, label: 'June' },
    { value: 7, label: 'July' },    { value: 8, label: 'August' },   { value: 9, label: 'September' },
    { value: 10, label: 'October' },{ value: 11, label: 'November' },{ value: 12, label: 'December' }
  ];

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  /* ------------------------- Delete modal ------------------------- */
  deleteModalOpen = false;
  categoryToDelete: any = null;

  /* ------------------------- Summary bar ------------------------- */
  totalBudget: number = 0;
  totalSpent: number = 0;
  remainingBalance: number = 0;
  percentUsed: number = 0;

  /* ------------------------- New Category ------------------------- */
  categoryModalOpen = false;
  newCategoryName = '';
  creatingCategory = false;
  createError = '';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUserDetails();
    if (user) {
      this.userID = user.id;
      this.userName = user.name;
    }
    this.loadAllData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.checkScrollButtons(), 200);
  }

  /* --------------------- Delete Modal handlers ---------------------- */
  openDeleteModal(cat: any) {
    this.categoryToDelete = cat;
    this.deleteModalOpen = true;
  }
  closeDeleteModal() {
    this.deleteModalOpen = false;
    this.categoryToDelete = null;
  }
  confirmDelete() {
    if (!this.categoryToDelete) return;

    this.http.delete(`${environment.apiUrl}/Category/${this.categoryToDelete.category_Id}`)
      .subscribe(() => {
        this.closeDeleteModal();
        this.loadAllData();
      });
  }

  /* --------------------- Month Navigation ---------------------- */
  onMonthChange(value: string) {
    this.selectedMonth = Number(value);
    this.loadAllData();
  }
  nextMonth() {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.loadAllData();
  }
  prevMonth() {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.loadAllData();
  }

  /* --------------------- Cards Scroll Buttons ---------------------- */
  checkScrollButtons() {
    if (!this.cardsContainer) return;
    const el = this.cardsContainer.nativeElement;
    this.canScrollLeft = el.scrollLeft > 5;
    this.canScrollRight = el.scrollLeft + el.clientWidth + 5 < el.scrollWidth;
  }
  onCardsScroll() { this.checkScrollButtons(); }
  scrollLeft() {
    const el = this.cardsContainer.nativeElement;
    el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' });
    setTimeout(() => this.checkScrollButtons(), 300);
  }
  scrollRight() {
    const el = this.cardsContainer.nativeElement;
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
    setTimeout(() => this.checkScrollButtons(), 300);
  }

  /* --------------------- Load Everything ---------------------- */
  loadAllData() {
    this.loading = true;

    const categories$ = this.http.get<any[]>(`${environment.apiUrl}/Category`).pipe(catchError(() => of([])));
    const budgets$ = this.http.get<any[]>(`${environment.apiUrl}/Budget?userId=${this.userID}`).pipe(catchError(() => of([])));
    const expenses$ = this.http.get<any[]>(`${environment.apiUrl}/Expense?userId=${this.userID}`).pipe(catchError(() => of([])));

    forkJoin({ categories: categories$, budgets: budgets$, expenses: expenses$ })
      .subscribe(({ categories, budgets, expenses }) => {

        this.loading = false;

        this.categories = (categories || []).filter(c => c.isActive !== false);
        this.expenses = expenses || [];

        this.budgets = {};
        this.budgetRecordMap = {};

        budgets.forEach(b => {
          if (b.month === this.selectedMonth && b.year === this.selectedYear) {
            this.budgetRecordMap[b.category_id] = b;
            this.budgets[b.category_id] = Number(b.amount) || 0;
          }
        });

        this.categories.forEach(cat => {
          if (this.budgets[cat.category_Id] === undefined) {
            this.budgets[cat.category_Id] = 0;
          }
        });

        this.calculateSummary(expenses);
        setTimeout(() => {
          this.createDonutChart();
          this.buildExpenseBars();
        }, 50);
      });
  }

  /* --------------------- Summary Calculation ---------------------- */
  calculateSummary(expenses: any[]) {
    const monthlyExpenses = expenses.filter(e =>
      new Date(e.transaction_date).getMonth() + 1 === this.selectedMonth &&
      new Date(e.transaction_date).getFullYear() === this.selectedYear
    );

    this.totalBudget = Object.values(this.budgets).reduce((a, b) => a + (Number(b) || 0), 0);
    this.totalSpent = monthlyExpenses.reduce((a, b) => a + (Number(b.amount) || 0), 0);
    this.remainingBalance = this.totalBudget - this.totalSpent;

    this.percentUsed = this.totalBudget ? Math.min(100, Math.round((this.totalSpent / this.totalBudget) * 100)) : 0;
  }

  /* --------------------- Content Editable Budget Input ---------------------- */
  onKeyDown(event: KeyboardEvent, cat: any) {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (allowed.includes(event.key)) {
      if (event.key === 'Enter') {
        event.preventDefault();
        (event.target as HTMLElement).blur();
        this.saveBudget(cat);
      }
      return;
    }
    if (!/^\d$/.test(event.key)) event.preventDefault();
  }

  onInput(event: any, catId: number) {
    const el = event.target as HTMLElement;
    const clean = el.innerText.replace(/\D+/g, '');
    el.style.textAlign = 'right';
    this.budgets[catId] = clean ? Number(clean) : 0;

    if (clean !== el.innerText) {
      el.innerText = clean;
      this.setCaretToEnd(el);
    }
  }

  onFocus(event: any, id: number) {
    const el = event.target as HTMLElement;
    el.style.textAlign = 'right';
    if (this.budgets[id] === 0) el.innerText = '';
    this.setCaretToEnd(el);
  }

  onBlur(event: any, id: number) {
    const el = event.target as HTMLElement;
    const clean = el.innerText.trim();
    if (clean === '') this.budgets[id] = 0;

    const cat = this.categories.find(c => c.category_Id === id);
    if (cat) this.saveBudget(cat);
  }

  saveBudget(cat: any) {
    const catId = cat.category_Id;
    const amount = Number(this.budgets[catId] || 0);
    const existing = this.budgetRecordMap[catId];

    if (existing && Number(existing.amount) === amount) return;

    const body = {
      budget_id: existing ? existing.budget_id : 0,
      user_id: this.userID,
      user_name: this.userName,
      category_id: catId,
      category_name: cat.category_Name,
      amount,
      month: this.selectedMonth,
      year: this.selectedYear,
      isActive: true
    };

    if (existing?.budget_id) {
      this.http.put(`${environment.apiUrl}/Budget/${existing.budget_id}`, body).subscribe(() => this.loadAllData());
    } else {
      this.http.post(`${environment.apiUrl}/Budget`, body).subscribe(() => this.loadAllData());
    }
  }

  setCaretToEnd(el: HTMLElement) {
    try {
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) { sel.removeAllRanges(); sel.addRange(range); }
    } catch {}
  }

  /* --------------------- Create Category ---------------------- */
  openNewCategoryModal() {
    this.newCategoryName = '';
    this.createError = '';
    this.categoryModalOpen = true;
    setTimeout(() => (document.querySelector('.modal input') as HTMLInputElement)?.focus(), 50);
  }

  defaultCategories = ['food', 'rent', 'bills', 'commute', 'gym'];

  isDefaultCategory(cat: any): boolean {
    return this.defaultCategories.includes(cat.category_Name.toLowerCase());
  }

  closeNewCategoryModal() {
    this.categoryModalOpen = false;
    this.newCategoryName = '';
    this.createError = '';
  }

  createCategory() {
    const name = this.newCategoryName.trim();
    if (!name) {
      this.createError = 'Category name is required';
      return;
    }

    this.creatingCategory = true;
    const body = { category_Name: name };

    this.http.post(`${environment.apiUrl}/Category`, body)
      .pipe(catchError(err => {
        this.createError = 'Failed to create category';
        this.creatingCategory = false;
        return of(null);
      }))
      .subscribe(() => {
        this.creatingCategory = false;
        this.closeNewCategoryModal();
        this.loadAllData();
      });
  }

  deleteCategory(cat: any) {
    if (!confirm(`Delete category "${cat.category_Name}"?`)) return;

    this.http.delete(`${environment.apiUrl}/Category/${cat.category_Id}`)
      .subscribe(() => this.loadAllData());
  }

  /* --------------------- DOUGHNUT CHART ---------------------- */
  createDonutChart() {
    const labels = this.categories.map(c => c.category_Name);
    const values = this.categories.map(c => this.budgets[c.category_Id] || 0);

    const ctx = document.getElementById('budgetDonut') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.budgetChart) this.budgetChart.destroy();

    this.budgetChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: [
            "#FF6B6B",
            "#4DABF7",
            "#51CF66",
            "#FFD43B",
            "#9775FA",
            "#FFA94D"
          ],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        cutout: '65%',
        layout: {
          padding: { right: 40 }
        },
        plugins: {
          legend: {
            position: 'bottom',
            align: 'center',
            labels: {
              boxWidth: 14,
              boxHeight: 14,
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { size: 14 }
            }
          },
          tooltip: {
            backgroundColor: "#1e293b",
            titleFont: { size: 13 },
            bodyFont: { size: 13 },
            padding: 10,
            callbacks: {
              label: function (ctx) {
                let total = ctx.dataset.data.reduce((a: any, b: any) => a + b, 0);
                let percent = ((ctx.parsed / total) * 100).toFixed(0);
                return `${ctx.label}: ${percent}%`;
              }
            }
          }
        }
      }
    });
  }

  /* --------------------- EXPENSE BAR BUILDER ---------------------- */
  buildExpenseBars() {
    const monthlyExpenses = this.expenses.filter(e =>
      new Date(e.transaction_date).getMonth() + 1 === this.selectedMonth &&
      new Date(e.transaction_date).getFullYear() === this.selectedYear
    );

    const spentByName: Record<string, number> = {};
    this.categories.forEach(cat => spentByName[cat.category_Name.toLowerCase()] = 0);

    monthlyExpenses.forEach(e => {
      const name = (e.category_name || '').toLowerCase();
      if (spentByName[name] !== undefined) {
        spentByName[name] += Number(e.amount || 0);
      }
    });

    this.expenseBars = this.categories.map(cat => {
      const key = cat.category_Name.toLowerCase();
      const spent = spentByName[key] || 0;
      const budget = Number(this.budgets[cat.category_Id] || 0);

      const percentExact = budget > 0 ? (spent / budget) * 100 : 0;
      const percent = Math.min(100, Math.round(percentExact));

      return {
        categoryName: cat.category_Name,
        budget,
        spent,
        percent,
        percentExact,
        fillWidth: Math.min(100, percentExact),
        over: spent > budget,
        displayPercentText: `${percentExact.toFixed(0)}%`
      };
    });
  }

}
