import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ConfiguracoesComponent } from './configuracoes.component';
import { ConfigService } from '@services/config.service';

class ConfigServiceStub {
  listarCampus = jasmine
    .createSpy()
    .and.returnValue(of({ campus: [{ id: 1, nome: 'Campus' }] }));
  listarCursos = jasmine
    .createSpy()
    .and.returnValue(of({ cursos: [{ id: 1, nome: 'Curso' }] }));
  // backend retorna array direto:
  listarBolsas = jasmine
    .createSpy()
    .and.returnValue(of([{ id_aluno: 10, possui_bolsa: true }]));
  criarCurso = jasmine.createSpy().and.returnValue(of({}));
  criarCampus = jasmine.createSpy().and.returnValue(of({}));
  criarBolsa = jasmine.createSpy().and.returnValue(of({}));

  // novos métodos:
  excluirCurso = jasmine.createSpy().and.returnValue(of({}));
  excluirCampus = jasmine.createSpy().and.returnValue(of({}));
  excluirBolsa = jasmine.createSpy().and.returnValue(of({}));
}

describe('ConfiguracoesComponent', () => {
  let component: ConfiguracoesComponent;
  let service: ConfigServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracoesComponent],
      providers: [{ provide: ConfigService, useClass: ConfigServiceStub }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ConfiguracoesComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ConfigService) as unknown as ConfigServiceStub;
    fixture.detectChanges(); // ngOnInit
  });

  it('should load initial lists on init', () => {
    expect(service.listarCampus).toHaveBeenCalled();
    expect(service.listarCursos).toHaveBeenCalled();
    expect(service.listarBolsas).toHaveBeenCalled();
  });

  it('should create a new course', () => {
    component.novoCurso = 'Novo Curso';
    component.cadastrarCurso();
    expect(service.criarCurso).toHaveBeenCalledWith({ nome: 'Novo Curso' });
    expect(component.novoCurso).toBe('');
  });

  it('should delete campus, course and bolsa', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.excluirCampus(1);
    expect(service.excluirCampus).toHaveBeenCalledWith(1);

    component.excluirCurso(2);
    expect(service.excluirCurso).toHaveBeenCalledWith(2);

    component.excluirBolsa(10);
    expect(service.excluirBolsa).toHaveBeenCalledWith(10);
  });
});
