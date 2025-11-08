import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ListagemAvaliadoresComponent } from './listagem-avaliadores.component';
import { ProjetoService } from '@services/projeto.service';
import { Router } from '@angular/router';

class ProjetoServiceStub {
  listarAvaliadoresExternos = jasmine
    .createSpy()
    .and.returnValue(of([{ id: 1, nome: 'Avaliador', link_lattes: null }]));
  deleteAvaliador = jasmine.createSpy().and.returnValue(of({}));
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('ListagemAvaliadoresComponent', () => {
  let component: ListagemAvaliadoresComponent;
  let service: ProjetoServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemAvaliadoresComponent],
      providers: [
        { provide: ProjetoService, useClass: ProjetoServiceStub },
        { provide: Router, useClass: RouterStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ListagemAvaliadoresComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ProjetoService) as unknown as ProjetoServiceStub;
    component.ngOnInit();
  });

  it('should load and normalise evaluators', () => {
    expect(component.avaliadores[0].link_lattes).toBe('');
  });

  it('should delete an evaluator after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.excluir(1);
    expect(service.deleteAvaliador).toHaveBeenCalledWith(1);
  });

  it('should open the modal flag', () => {
    component.abrirModal();
    expect(component.showModal).toBeTrue();
  });
});
