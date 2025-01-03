import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TigoPaymentAdminComponent } from './tigo-payment-admin.component';

describe('TigoPaymentAdminComponent', () => {
  let component: TigoPaymentAdminComponent;
  let fixture: ComponentFixture<TigoPaymentAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TigoPaymentAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TigoPaymentAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
