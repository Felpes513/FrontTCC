import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavSecretariaComponent } from './sidenav-secretaria.component';

describe('SidenavSecretariaComponent', () => {
  let component: SidenavSecretariaComponent;
  let fixture: ComponentFixture<SidenavSecretariaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidenavSecretariaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidenavSecretariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
