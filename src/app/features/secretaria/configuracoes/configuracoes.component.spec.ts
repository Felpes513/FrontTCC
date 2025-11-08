import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ConfiguracoesComponent } from './configuracoes.component';
import { ConfigService } from '@services/config.service';

class ConfigServiceStub {
  listarCampus = jasmine.createSpy().and.returnValue(of({ campus: [{ id: 1, nome: 'Campus' }] }));
  listarCursos = jasmine.createSpy().and.returnValue(of({ cursos: [{ id: 1, nome: 'Curso' }] }));
  listarBolsas = jasmine.createSpy().and.returnValue(of({ bolsas: [] }));
  criarCurso = jasmine.createSpy().and.returnValue(of({}));
  criarCampus = jasmine.createSpy().and.returnValue(of({}));
  criarBolsa = jasmine.createSpy().and.returnValue(of({}));
  forgotPassword = jasmine.createSpy().and.returnValue(of({ message: 'ok' }));
  resetPasswordDirect = jasmine.createSpy().and.returnValue(of({ message: 'senha' }));
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
    component.ngOnInit();
  });

  it('should load initial lists on init', () => {
    expect(service.listarCampus).toHaveBeenCalled();
    expect(component.campus.length).toBe(1);
  });

  it('should create a new course', () => {
    component.novoCurso = 'Novo Curso';
    component.cadastrarCurso();
    expect(service.criarCurso).toHaveBeenCalled();
    expect(component.novoCurso).toBe('');
  });

  it('should validate direct password reset', () => {
    component.novaSenhaReset = '123456';
    component.confirmaSenhaReset = '654321';
    component.resetarSenhaDireto();
    expect(component.mensagemReset).toBe('As senhas não conferem.');
  });
});
