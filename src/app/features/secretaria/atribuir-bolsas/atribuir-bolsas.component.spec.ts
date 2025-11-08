import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtribuirBolsasComponent } from './atribuir-bolsas.component';

describe('AtribuirBolsasComponent', () => {
  let component: AtribuirBolsasComponent;
  let fixture: ComponentFixture<AtribuirBolsasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtribuirBolsasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtribuirBolsasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
