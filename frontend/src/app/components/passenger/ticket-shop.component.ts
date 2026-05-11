import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { WalletService } from '../../services/wallet.service';
import { TicketService } from '../../services/ticket.service';
import { TicketCategory, TicketDefinition } from '../../models/ticket.model';

@Component({
  selector: 'app-ticket-shop',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <section class="space-y-4">
      <header class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-slate-800">Sklep z biletami</h2>
        @if (notice(); as msg) {
          <span
            [class]="
              noticeKind() === 'success'
                ? 'text-sm px-3 py-1 rounded bg-green-100 text-green-800'
                : 'text-sm px-3 py-1 rounded bg-red-100 text-red-800'
            "
            >{{ msg }}</span
          >
        }
      </header>

      <div class="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          (click)="category.set('normalny')"
          [class]="tabClass('normalny')"
        >
          Normalny
        </button>
        <button
          type="button"
          (click)="category.set('ulgowy')"
          [class]="tabClass('ulgowy')"
        >
          Ulgowy (−50%)
        </button>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (def of filteredCatalog(); track def.id) {
          <article
            class="bg-white rounded-xl shadow border border-slate-200 p-5 flex flex-col gap-4 hover:shadow-md transition"
          >
            <header class="flex items-start justify-between gap-3">
              <h3 class="font-semibold text-slate-800 leading-tight">{{ def.name }}</h3>
              <div class="flex flex-col items-end gap-1">
                <span [class]="typeBadgeClass(def.type)">{{ def.type }}</span>
                <span [class]="categoryBadgeClass(def.category)">{{ def.category }}</span>
              </div>
            </header>
            <p class="text-3xl font-bold text-slate-900 tabular-nums">
              {{ def.price | number: '1.2-2' }} <span class="text-base text-slate-500">PLN</span>
            </p>
            <button
              (click)="buy(def)"
              [disabled]="!wallet.canAfford(def.price)"
              class="mt-auto bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
            >
              @if (wallet.canAfford(def.price)) {
                Kup za {{ def.price | number: '1.2-2' }} PLN
              } @else {
                Niewystarczające saldo
              }
            </button>
          </article>
        }
      </div>
    </section>
  `
})
export class TicketShopComponent {
  private readonly api = inject(ApiService);
  private readonly tickets = inject(TicketService);
  readonly wallet = inject(WalletService);

  readonly category = signal<TicketCategory>('normalny');
  readonly filteredCatalog = computed(() =>
    this.tickets.catalog().filter((d) => d.category === this.category())
  );

  readonly notice = signal<string | null>(null);
  readonly noticeKind = signal<'success' | 'error'>('success');

  async buy(def: TicketDefinition): Promise<void> {
    try {
      const ticket = await this.api.purchaseTicket(def.id);
      this.noticeKind.set('success');
      this.notice.set(`Zakupiono bilet ${ticket.name} (${ticket.id}).`);
    } catch (err) {
      this.noticeKind.set('error');
      this.notice.set(err instanceof Error ? err.message : 'Błąd zakupu');
    }
    setTimeout(() => this.notice.set(null), 4000);
  }

  tabClass(target: TicketCategory): string {
    const base = 'px-4 py-1.5 text-sm font-medium rounded-md transition';
    return this.category() === target
      ? `${base} bg-brand-600 text-white shadow`
      : `${base} text-slate-600 hover:text-slate-900`;
  }

  typeBadgeClass(type: TicketDefinition['type']): string {
    const base = 'text-[10px] uppercase font-semibold px-2 py-0.5 rounded';
    switch (type) {
      case 'jednorazowy':
        return `${base} bg-blue-100 text-blue-700`;
      case 'czasowy':
        return `${base} bg-amber-100 text-amber-700`;
      case 'okresowy':
        return `${base} bg-purple-100 text-purple-700`;
    }
  }

  categoryBadgeClass(category: TicketCategory): string {
    const base = 'text-[10px] uppercase font-semibold px-2 py-0.5 rounded';
    return category === 'ulgowy'
      ? `${base} bg-emerald-100 text-emerald-700`
      : `${base} bg-slate-100 text-slate-700`;
  }
}
