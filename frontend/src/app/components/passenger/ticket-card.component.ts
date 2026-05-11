import { Component, OnDestroy, computed, effect, input, signal } from '@angular/core';
import { toDataURL } from 'qrcode';
import { Ticket } from '../../models/ticket.model';

@Component({
  selector: 'app-ticket-card',
  standalone: true,
  template: `
    <article
      class="bg-white rounded-xl shadow border-2 p-5 flex flex-col gap-4 transition"
      [class.border-red-400]="isExpired()"
      [class.border-green-400]="!isExpired() && ticket().status === 'validated'"
      [class.border-slate-200]="!isExpired() && ticket().status !== 'validated'"
    >
      <header class="flex items-start justify-between gap-2">
        <div>
          <h3 class="font-semibold text-slate-800 leading-tight">{{ ticket().name }}</h3>
          <p class="text-xs text-slate-500 mt-1">ID: {{ ticket().id }}</p>
          <span [class]="categoryBadge()">{{ ticket().category }}</span>
        </div>
        <span [class]="statusBadge()">{{ statusLabel() }}</span>
      </header>

      <div
        class="bg-slate-900 rounded-lg p-4 flex flex-col items-center gap-3 text-white"
        aria-label="Kod biletu"
      >
        <div class="w-full flex justify-between text-[10px] uppercase tracking-widest text-slate-400">
          <span>Bilet PIISW</span>
          <span>{{ ticket().type }}</span>
        </div>
        @if (qrDataUrl(); as url) {
          <img
            [src]="url"
            alt="Kod QR biletu"
            class="bg-white rounded p-1 w-40 h-40"
          />
        } @else {
          <div class="w-40 h-40 bg-slate-700 rounded animate-pulse" aria-hidden="true"></div>
        }
        <p class="font-mono tracking-[0.2em] text-center text-xs break-all">{{ ticket().id }}</p>
      </div>

      <dl class="text-xs text-slate-600 grid grid-cols-2 gap-y-1">
        <dt>Zakupiono:</dt>
        <dd class="text-right">{{ purchaseLabel() }}</dd>
        @if (ticket().validationTime) {
          <dt>Skasowano:</dt>
          <dd class="text-right">{{ validationLabel() }}</dd>
        }
        @if (ticket().vehicleId) {
          <dt>Pojazd:</dt>
          <dd class="text-right font-mono">{{ ticket().vehicleId }}</dd>
        }
        <dt>Ważny do:</dt>
        <dd class="text-right">{{ validUntilLabel() }}</dd>
        @if (remainingLabel(); as r) {
          <dt>Pozostały czas:</dt>
          <dd class="text-right font-mono" [class.text-red-600]="isExpired()">{{ r }}</dd>
        }
      </dl>
    </article>
  `
})
export class TicketCardComponent implements OnDestroy {
  readonly ticket = input.required<Ticket>();

  private readonly now = signal(Date.now());
  private readonly tickHandle: ReturnType<typeof setInterval>;
  private readonly _qrDataUrl = signal<string>('');
  readonly qrDataUrl = this._qrDataUrl.asReadonly();

  constructor() {
    this.tickHandle = setInterval(() => this.now.set(Date.now()), 1000);
    effect(() => {
      const id = this.ticket().id;
      toDataURL(id, { errorCorrectionLevel: 'M', margin: 1, width: 240 })
        .then((url) => this._qrDataUrl.set(url))
        .catch(() => this._qrDataUrl.set(''));
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.tickHandle);
  }

  readonly isExpired = computed(() => {
    const t = this.ticket();
    return !!t.validUntil && this.now() > t.validUntil;
  });

  readonly statusLabel = computed(() => {
    if (this.isExpired()) return 'wygasły';
    switch (this.ticket().status) {
      case 'active':
        return 'aktywny';
      case 'validated':
        return 'skasowany';
      case 'expired':
        return 'nieważny';
    }
  });

  readonly statusBadge = computed(() => {
    const base = 'text-[10px] uppercase font-bold px-2 py-1 rounded tracking-wide';
    if (this.isExpired()) return `${base} bg-red-100 text-red-700`;
    switch (this.ticket().status) {
      case 'active':
        return `${base} bg-blue-100 text-blue-700`;
      case 'validated':
        return `${base} bg-green-100 text-green-700`;
      case 'expired':
        return `${base} bg-slate-200 text-slate-600`;
    }
  });

  readonly categoryBadge = computed(() => {
    const base = 'inline-block mt-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded tracking-wide';
    return this.ticket().category === 'ulgowy'
      ? `${base} bg-emerald-100 text-emerald-700`
      : `${base} bg-slate-100 text-slate-700`;
  });

  readonly remainingLabel = computed(() => {
    const t = this.ticket();
    if (!t.validUntil) return null;
    const diff = t.validUntil - this.now();
    if (diff <= 0) return 'wygasł';
    const totalMinutes = Math.ceil(diff / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  });

  readonly purchaseLabel = computed(() =>
    new Date(this.ticket().purchaseTime).toLocaleString('pl-PL')
  );

  readonly validationLabel = computed(() => {
    const t = this.ticket().validationTime;
    return t ? new Date(t).toLocaleString('pl-PL') : '';
  });

  readonly validUntilLabel = computed(() => {
    const t = this.ticket();
    if (t.validUntil) return new Date(t.validUntil).toLocaleString('pl-PL');
    if (t.type === 'czasowy' && t.durationMinutes) {
      return `po aktywacji: ${t.durationMinutes} min`;
    }
    if (t.type === 'okresowy' && t.validityDays) {
      return `po aktywacji: ${t.validityDays} dni`;
    }
    if (t.type === 'jednorazowy') {
      return 'jeden przejazd po skasowaniu';
    }
    return '—';
  });
}
