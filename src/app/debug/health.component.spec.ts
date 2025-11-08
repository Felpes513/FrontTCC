import { TestBed } from '@angular/core/testing';
import { HealthComponent } from './health.component';

describe('HealthComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthComponent],
    }).compileComponents();
  });

  it('should render the health message', () => {
    const fixture = TestBed.createComponent(HealthComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Router OK');
  });
});
