import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly _loading = signal<boolean>(false);
  private readonly _message = signal<string>('');

  readonly loading = this._loading.asReadonly();
  readonly message = this._message.asReadonly();

  begin(message = ''): void {
    this._message.set(message);
    this._loading.set(true);
  }

  end(): void {
    this._loading.set(false);
    this._message.set('');
  }
}
