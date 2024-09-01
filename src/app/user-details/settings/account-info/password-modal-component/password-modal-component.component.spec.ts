import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordModalComponentComponent } from './password-modal-component.component';

describe('PasswordModalComponentComponent', () => {
  let component: PasswordModalComponentComponent;
  let fixture: ComponentFixture<PasswordModalComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordModalComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PasswordModalComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
