import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { VerificationFormComponent } from './verification-form.component';
import { ApiService } from '../../services/api.service';
import { VerificationResult } from '../../models/ticket.model';

describe('VerificationFormComponent', () => {
  let fixture: ComponentFixture<VerificationFormComponent>;
  let component: VerificationFormComponent;
  let api: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VerificationFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    fixture = TestBed.createComponent(VerificationFormComponent);
    component = fixture.componentInstance;
    api = TestBed.inject(ApiService);
    fixture.detectChanges();
  });

  it('shows the placeholder result panel before any submission', () => {
    expect(fixture.nativeElement.textContent).toContain('Wynik weryfikacji pojawi się tutaj.');
  });

  it('does not call the API when either field is empty', async () => {
    const spy = spyOn(api, 'verifyTicket');
    component.ticketId = 'TKT-X';
    component.vehicleId = '   ';
    await component.verify();
    expect(spy).not.toHaveBeenCalled();
  });

  it('renders the success panel when the API returns a valid result', async () => {
    const result: VerificationResult = {
      valid: true,
      message: 'Bilet jednorazowy ważny w tym pojeździe.'
    };
    spyOn(api, 'verifyTicket').and.returnValue(of(result));

    component.ticketId = 'TKT-A';
    component.vehicleId = 'TRAM-1';
    await component.verify();
    fixture.detectChanges();

    expect(component.pending()).toBeFalse();
    expect(component.result()).toEqual(result);
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('BILET WAŻNY');
    expect(text).toContain('ważny w tym pojeździe');
  });

  it('renders the failure panel when the API returns an invalid result', async () => {
    spyOn(api, 'verifyTicket').and.returnValue(
      of<VerificationResult>({ valid: false, message: 'Bilet stracił ważność.' })
    );
    component.ticketId = 'TKT-B';
    component.vehicleId = 'BUS-2';
    await component.verify();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('BILET NIEWAŻNY');
  });

  it('catches API errors and surfaces them in the failure panel', async () => {
    spyOn(api, 'verifyTicket').and.returnValue(throwError(() => new Error('Network down')));
    component.ticketId = 'TKT-C';
    component.vehicleId = 'BUS-3';
    await component.verify();
    expect(component.result()?.valid).toBeFalse();
    expect(component.result()?.message).toBe('Network down');
  });

  describe('canSubmit', () => {
    it('is false when fields are blank', () => {
      component.ticketId = '   ';
      component.vehicleId = '';
      expect(component.canSubmit).toBeFalse();
    });

    it('is true when both fields have content', () => {
      component.ticketId = 'TKT-X';
      component.vehicleId = 'BUS-1';
      expect(component.canSubmit).toBeTrue();
    });
  });
});
