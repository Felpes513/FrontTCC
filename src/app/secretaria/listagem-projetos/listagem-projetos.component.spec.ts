import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListagemProjetosComponent } from './listagem-projetos.component';

describe('ListagemProjetosComponent', () => {
  let component: ListagemProjetosComponent;
  let fixture: ComponentFixture<ListagemProjetosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemProjetosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListagemProjetosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
