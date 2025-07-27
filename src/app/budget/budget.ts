import { Component } from '@angular/core';

@Component({
  selector: 'app-budget',
  imports: [],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
})
export class Budget {
  budgets = {
    food: 5000,
  };
  onKeyDown(event: KeyboardEvent) {
    if (event.key.length === 1 && !/^\d$/.test(event.key)) {
      event.preventDefault();
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      (event.target as any)?.blur(); 
    }
  }
  onInput(event: any) {
    const el = event.target;
    const text = el.innerText.replace(/\D+/g, '');
    if (el.innerText !== text) el.innerText = text;

    this.budgets.food = text;
  }
}
