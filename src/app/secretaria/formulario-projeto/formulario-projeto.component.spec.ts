import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioProjetoComponent } from './formulario-projeto.component';

describe('FormularioProjetoComponent', () => {
  let component: FormularioProjetoComponent;
  let fixture: ComponentFixture<FormularioProjetoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioProjetoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioProjetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
