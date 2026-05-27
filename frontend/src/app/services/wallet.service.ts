import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { ApiService, WalletResponse } from './api.service';
import { PaymentService } from './payment.service';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly api = inject(ApiService);
  private readonly payment = inject(PaymentService);

  private readonly _balance = signal<number>(0);
  readonly balance = this._balance.asReadonly();

  refresh(): void {
    this.api.getWallet().subscribe((wallet) => this._balance.set(wallet.balance));
  }

  topUp(amount: number): Observable<WalletResponse> {
    this.payment.begin('Łączenie z bankiem...');
    return this.api.topUp(amount).pipe(
      tap((wallet) => this._balance.set(wallet.balance)),
      finalize(() => this.payment.end())
    );
  }

  canAfford(amount: number): boolean {
    return this._balance() >= amount;
  }
}
