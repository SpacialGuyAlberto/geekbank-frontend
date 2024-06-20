import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KinguinGiftCardsComponent } from './kinguin-gift-cards.component';

describe('KinguinGiftCardsComponent', () => {
  let component: KinguinGiftCardsComponent;
  let fixture: ComponentFixture<KinguinGiftCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KinguinGiftCardsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KinguinGiftCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
