import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Home } from './home/home';
import { authGuard } from './auth-guard';
import { Budget } from './budget/budget';
import { DashboardLayout } from './dashboard-layout/dashboard-layout';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    canActivate: [authGuard],
    path: 'dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '',
        component: Dashboard
      },
      {
        path: 'budget',
        component: Budget
      }
    ]
  },
];
