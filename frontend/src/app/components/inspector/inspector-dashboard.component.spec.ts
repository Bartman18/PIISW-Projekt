import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InspectorDashboardComponent } from './inspector-dashboard.component';

describe('InspectorDashboardComponent', () => {
  let fixture: ComponentFixture<InspectorDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [InspectorDashboardComponent] });
    fixture = TestBed.createComponent(InspectorDashboardComponent);
    fixture.detectChanges();
  });

  it('renders the header and embeds the verification form', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Panel kontroli biletów');
    expect(fixture.nativeElement.querySelector('app-verification-form')).not.toBeNull();
  });
});
