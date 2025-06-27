import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioProjetoComponent } from './formulario-projeto.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('FormularioProjetoComponent', () => {
  let component: FormularioProjetoComponent;
  let fixture: ComponentFixture<FormularioProjetoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormularioProjetoComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        CommonModule,
        FormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioProjetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
