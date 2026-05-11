import { Routes } from '@angular/router';
import { inspectorGuard } from './guards/inspector.guard';
import { passengerGuard } from './guards/passenger.guard';

export const APP_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'passenger',
    canActivate: [passengerGuard],
    loadComponent: () =>
      import('./components/passenger/passenger-dashboard.component').then(
        (m) => m.PassengerDashboardComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'shop' },
      {
        path: 'shop',
        loadComponent: () =>
          import('./components/passenger/ticket-shop.component').then(
            (m) => m.TicketShopComponent
          )
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./components/passenger/ticket-list.component').then(
            (m) => m.TicketListComponent
          )
      }
    ]
  },
  {
    path: 'inspector',
    canActivate: [inspectorGuard],
    loadComponent: () =>
      import('./components/inspector/inspector-dashboard.component').then(
        (m) => m.InspectorDashboardComponent
      )
  },
  { path: '**', redirectTo: 'login' }
];
