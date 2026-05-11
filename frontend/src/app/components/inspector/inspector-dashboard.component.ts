import { Component } from '@angular/core';
import { VerificationFormComponent } from './verification-form.component';

@Component({
  selector: 'app-inspector-dashboard',
  standalone: true,
  imports: [VerificationFormComponent],
  template: `
    <div class="space-y-6">
      <header>
        <h1 class="text-2xl font-bold text-slate-800">Panel kontroli biletów</h1>
        <p class="text-slate-600 text-sm">
          Wpisz identyfikator biletu i pojazdu, aby zweryfikować ważność.
        </p>
      </header>
      <app-verification-form />
    </div>
  `
})
export class InspectorDashboardComponent {}
