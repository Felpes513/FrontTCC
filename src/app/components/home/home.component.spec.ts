import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HomeComponent],
    }).compileComponents();
  });

  it('should expose the marketing slides', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    expect(component.slides.length).toBeGreaterThan(0);
    component.slides.forEach((s) => {
      expect(s.title).toBeTruthy();
      expect(s.content).toBeTruthy();
      expect(s.img).toContain('assets');
    });
  });
});
