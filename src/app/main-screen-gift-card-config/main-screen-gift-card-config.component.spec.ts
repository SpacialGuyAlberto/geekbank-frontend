import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainScreenGiftCardConfigComponent } from './main-screen-gift-card-config.component';

describe('MainScreenGiftCardConfigComponent', () => {
  let component: MainScreenGiftCardConfigComponent;
  let fixture: ComponentFixture<MainScreenGiftCardConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainScreenGiftCardConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainScreenGiftCardConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
