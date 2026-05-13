import { Injectable, signal } from "@angular/core";

export interface PaymentResult {
  success: boolean;
  transactionId: string;
}

@Injectable({ providedIn: "root" })
export class PaymentService {
  private readonly _loading = signal<boolean>(false);
  private readonly _message = signal<string>("");

  readonly loading = this._loading.asReadonly();
  readonly message = this._message.asReadonly();

  private static readonly SIMULATED_DELAY_MS = 1500;

  process(
    amount: number,
    label = "Łączenie z bankiem...",
  ): Promise<PaymentResult> {
    this._loading.set(true);
    this._message.set(label);
    return new Promise<PaymentResult>((resolve) => {
      setTimeout(() => {
        this._loading.set(false);
        this._message.set("");
        resolve({
          success: true,
          transactionId:
            "TX-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
        });
      }, PaymentService.SIMULATED_DELAY_MS);
    });
  }
}
