import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListagemProjetosComponent } from './listagem-projetos.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('FormularioProjetoComponent', () => {
  let component: ListagemProjetosComponent;
  let fixture: ComponentFixture<ListagemProjetosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ListagemProjetosComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        CommonModule,
        FormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemProjetosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
