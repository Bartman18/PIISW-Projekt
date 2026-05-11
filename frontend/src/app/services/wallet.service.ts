import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly _balance = signal<number>(50.0);
  readonly balance = this._balance.asReadonly();

  topUp(amount: number): void {
    this._balance.update((b) => +(b + amount).toFixed(2));
  }

  canAfford(amount: number): boolean {
    return this._balance() >= amount;
  }

  debit(amount: number): boolean {
    if (!this.canAfford(amount)) return false;
    this._balance.update((b) => +(b - amount).toFixed(2));
    return true;
  }
}
