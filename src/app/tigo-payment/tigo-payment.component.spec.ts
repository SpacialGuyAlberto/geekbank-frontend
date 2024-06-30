import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TigoPaymentComponent } from './tigo-payment.component';

describe('TigoPaymentComponent', () => {
  let component: TigoPaymentComponent;
  let fixture: ComponentFixture<TigoPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TigoPaymentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TigoPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
