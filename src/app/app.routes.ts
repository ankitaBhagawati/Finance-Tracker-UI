import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Home } from './home/home';
import { authGuard } from './auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    canActivate: [authGuard],
    path: 'dashboard',
    component: Dashboard,
  },
];
