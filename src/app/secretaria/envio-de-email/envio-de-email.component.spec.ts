import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvioDeEmailComponent } from './envio-de-email.component';

describe('EnvioDeEmailComponent', () => {
  let component: EnvioDeEmailComponent;
  let fixture: ComponentFixture<EnvioDeEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnvioDeEmailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnvioDeEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
