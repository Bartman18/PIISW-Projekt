import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PassengerDashboardComponent } from './passenger-dashboard.component';

describe('PassengerDashboardComponent', () => {
  let fixture: ComponentFixture<PassengerDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PassengerDashboardComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    fixture = TestBed.createComponent(PassengerDashboardComponent);
    fixture.detectChanges();
  });

  it('renders wallet, navigation links and the router-outlet', () => {
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('app-wallet')).not.toBeNull();
    expect(root.querySelector('router-outlet')).not.toBeNull();
    const links = Array.from(root.querySelectorAll('nav a')).map((a) => a.textContent?.trim());
    expect(links).toContain('Sklep z biletami');
    expect(links).toContain('Moje bilety');
  });

  it('hides the spinner overlay when no payment is in flight', () => {
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });
});
