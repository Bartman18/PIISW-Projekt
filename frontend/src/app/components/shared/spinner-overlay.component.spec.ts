import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerOverlayComponent } from './spinner-overlay.component';

describe('SpinnerOverlayComponent', () => {
  let fixture: ComponentFixture<SpinnerOverlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SpinnerOverlayComponent] });
    fixture = TestBed.createComponent(SpinnerOverlayComponent);
  });

  it('does not render the overlay when visible is false', () => {
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders the overlay with the default message when visible is true', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain('Proszę czekać...');
  });

  it('renders the custom message when provided', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('message', 'Łączenie z bankiem...');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Łączenie z bankiem...');
  });
});
