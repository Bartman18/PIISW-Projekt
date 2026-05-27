import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { WalletService } from '../../services/wallet.service';
import { PaymentService } from '../../services/payment.service';
import { apiErrorMessage } from '../../services/api.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <section class="bg-gradient-to-br from-brand-700 to-brand-900 text-white rounded-xl shadow-lg p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p class="text-brand-100 text-sm uppercase tracking-wide">Saldo portfela</p>
          <p class="text-4xl font-bold tabular-nums mt-1">
            {{ wallet.balance() | number: '1.2-2' }}
            <span class="text-xl font-semibold text-brand-100">PLN</span>
          </p>
          @if (lastTopUp(); as info) {
            <p class="text-xs text-brand-100 mt-2">{{ info }}</p>
          }
        </div>
        <button
          (click)="topUp()"
          [disabled]="payment.loading()"
          class="bg-white text-brand-700 font-semibold px-5 py-3 rounded-lg shadow hover:bg-brand-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          Doładuj 20 PLN
        </button>
      </div>
    </section>
  `,
  host: { class: 'block' }
})
export class WalletComponent implements OnInit {
  readonly wallet = inject(WalletService);
  readonly payment = inject(PaymentService);
  readonly lastTopUp = signal<string | null>(null);

  ngOnInit(): void {
    this.wallet.refresh();
  }

  topUp(): void {
    const amount = 20;
    this.wallet.topUp(amount).subscribe({
      next: () => this.lastTopUp.set(`Doładowano ${amount.toFixed(2)} PLN`),
      error: (err) => this.lastTopUp.set(apiErrorMessage(err, 'Doładowanie nie powiodło się'))
    });
  }
}
