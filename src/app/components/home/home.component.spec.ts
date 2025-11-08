import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
    }).compileComponents();
  });

  it('should expose the marketing slides', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    expect(component.slides.length).toBeGreaterThan(0);
    component.slides.forEach((slide) => {
      expect(slide.title).toBeTruthy();
      expect(slide.content).toBeTruthy();
      expect(slide.img).toContain('assets');
    });
  });
});
