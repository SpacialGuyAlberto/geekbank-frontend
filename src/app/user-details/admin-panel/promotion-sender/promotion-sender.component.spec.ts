import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionSenderComponent } from './promotion-sender.component';

describe('PromotionSenderComponent', () => {
  let component: PromotionSenderComponent;
  let fixture: ComponentFixture<PromotionSenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromotionSenderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotionSenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
