import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalancePaymentComponent } from './balance-payment.component';

describe('BalancePaymentComponent', () => {
  let component: BalancePaymentComponent;
  let fixture: ComponentFixture<BalancePaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalancePaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalancePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
