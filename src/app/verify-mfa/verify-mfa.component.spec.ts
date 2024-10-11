import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyMfaComponent } from './verify-mfa.component';

describe('VerifyMfaComponent', () => {
  let component: VerifyMfaComponent;
  let fixture: ComponentFixture<VerifyMfaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyMfaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyMfaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
