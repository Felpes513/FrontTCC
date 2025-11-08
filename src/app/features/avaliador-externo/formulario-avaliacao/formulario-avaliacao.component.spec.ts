import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FormularioAvaliacaoExternaComponent } from './formulario-avaliacao.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjetoService } from '@services/projeto.service';

class ProjetoServiceStub {
  obterInfoPorToken = jasmine
    .createSpy()
    .and.returnValue(of({ projetoTitulo: 'Projeto', pdfUrl: 'http://teste' }));
  salvarAvaliacaoPorToken = jasmine.createSpy().and.returnValue(of({}));
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

describe('FormularioAvaliacaoExternaComponent', () => {
  let component: FormularioAvaliacaoExternaComponent;
  let service: ProjetoServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioAvaliacaoExternaComponent],
      providers: [
        { provide: ProjetoService, useClass: ProjetoServiceStub },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['token', 'abc']]) } },
        },
        { provide: Router, useClass: RouterStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(FormularioAvaliacaoExternaComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ProjetoService) as unknown as ProjetoServiceStub;
    component.ngOnInit();
  });

  it('should load project information from token', () => {
    expect(service.obterInfoPorToken).toHaveBeenCalledWith('abc');
    expect(component.projetoTitulo).toBe('Projeto');
    expect(component.carregando).toBeFalse();
  });

  it('should validate send availability', () => {
    component.carregando = false;
    component.nota = 8;
    expect(component.podeEnviar()).toBeTrue();
    component.nota = 12;
    expect(component.podeEnviar()).toBeFalse();
  });

  it('should propagate API errors', () => {
    service.salvarAvaliacaoPorToken.and.returnValue(
      throwError(() => ({ error: { detail: 'Erro' } }))
    );
    component.carregando = false;
    component.nota = 9;
    component.enviar();
    expect(component.erro).toBe('Erro');
  });
});
