import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';
import { API_BASE_URL } from '../../services/api.constants';

const LOGIN_URL = `${API_BASE_URL}/auth/login`;

function setInput(fixture: ComponentFixture<LoginComponent>, name: string, value: string): void {
  const input: HTMLInputElement = fixture.nativeElement.querySelector(`input[name="${name}"]`);
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let navigateSpy: jasmine.Spy;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    navigateSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('renders the login form with the test-accounts hint', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Logowanie');
    expect(text).toContain('Konta testowe');
    expect(text).toContain('pasazer');
    expect(text).toContain('bileter');
  });

  it('disables the submit button when fields are empty', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBeTrue();
  });

  it('enables the submit button when both fields are filled', async () => {
    setInput(fixture, 'username', 'pasazer');
    setInput(fixture, 'password', 'pasazer');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBeFalse();
  });

  it('navigates to /passenger after a successful passenger login', () => {
    component.username = 'pasazer';
    component.password = 'pasazer';
    component.submit();

    httpMock
      .expectOne(LOGIN_URL)
      .flush({ token: 'jwt', username: 'pasazer', displayName: 'Anna Kowalska', role: 'PASSENGER' });

    expect(navigateSpy).toHaveBeenCalledWith('/passenger');
    expect(component.error()).toBeNull();
  });

  it('navigates to /inspector after a successful inspector login', () => {
    component.username = 'bileter';
    component.password = 'bileter';
    component.submit();

    httpMock
      .expectOne(LOGIN_URL)
      .flush({ token: 'jwt', username: 'bileter', displayName: 'Jan Nowak', role: 'INSPECTOR' });

    expect(navigateSpy).toHaveBeenCalledWith('/inspector');
  });

  it('shows an error and does not navigate on bad credentials', () => {
    component.username = 'pasazer';
    component.password = 'wrong';
    component.submit();

    httpMock
      .expectOne(LOGIN_URL)
      .flush({ message: 'Błędny login lub hasło' }, { status: 401, statusText: 'Unauthorized' });

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(component.error()).toBe('Nieprawidłowy login lub hasło.');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nieprawidłowy login lub hasło.');
  });
});
