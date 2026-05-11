import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner-overlay',
  standalone: true,
  template: `
    @if (visible()) {
      <div
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center"
        role="dialog"
        aria-live="assertive"
      >
        <div class="bg-white rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center gap-4 min-w-[280px]">
          <div
            class="w-14 h-14 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin-slow"
            aria-hidden="true"
          ></div>
          <p class="text-slate-700 font-medium text-center">{{ message() }}</p>
        </div>
      </div>
    }
  `
})
export class SpinnerOverlayComponent {
  readonly visible = input<boolean>(false);
  readonly message = input<string>('Proszę czekać...');
}
