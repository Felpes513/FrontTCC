import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnvioDeEmailComponent } from './envio-de-email.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('FormularioProjetoComponent', () => {
  let component: EnvioDeEmailComponent;
  let fixture: ComponentFixture<EnvioDeEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EnvioDeEmailComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        CommonModule,
        FormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EnvioDeEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
