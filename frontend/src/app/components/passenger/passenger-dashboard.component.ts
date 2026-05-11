import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { WalletComponent } from './wallet.component';
import { PaymentService } from '../../services/payment.service';
import { SpinnerOverlayComponent } from '../shared/spinner-overlay.component';

@Component({
  selector: 'app-passenger-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, WalletComponent, SpinnerOverlayComponent],
  template: `
    <div class="space-y-6">
      <app-wallet />

      <nav class="flex gap-2 border-b border-slate-200">
        <a
          routerLink="shop"
          routerLinkActive="border-brand-600 text-brand-700"
          class="px-4 py-2 -mb-px border-b-2 border-transparent text-slate-600 hover:text-brand-700"
        >
          Sklep z biletami
        </a>
        <a
          routerLink="tickets"
          routerLinkActive="border-brand-600 text-brand-700"
          class="px-4 py-2 -mb-px border-b-2 border-transparent text-slate-600 hover:text-brand-700"
        >
          Moje bilety
        </a>
      </nav>

      <router-outlet />
    </div>

    <app-spinner-overlay [visible]="payment.loading()" [message]="payment.message()" />
  `
})
export class PassengerDashboardComponent {
  readonly payment = inject(PaymentService);
}
