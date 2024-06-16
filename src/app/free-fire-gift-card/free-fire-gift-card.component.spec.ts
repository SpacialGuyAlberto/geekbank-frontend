import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeFireGiftCardComponent } from './free-fire-gift-card.component';

describe('FreeFireGiftCardComponent', () => {
  let component: FreeFireGiftCardComponent;
  let fixture: ComponentFixture<FreeFireGiftCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreeFireGiftCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FreeFireGiftCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
