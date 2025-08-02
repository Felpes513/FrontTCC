import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListagemAvaliadoresComponent } from './listagem-avaliadores.component';

describe('ListagemAvaliadoresComponent', () => {
  let component: ListagemAvaliadoresComponent;
  let fixture: ComponentFixture<ListagemAvaliadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemAvaliadoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListagemAvaliadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
