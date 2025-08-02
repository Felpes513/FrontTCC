import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioAvaliadorComponent } from './formulario-avaliador.component';

describe('FormularioAvaliadorComponent', () => {
  let component: FormularioAvaliadorComponent;
  let fixture: ComponentFixture<FormularioAvaliadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioAvaliadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioAvaliadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
