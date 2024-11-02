import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomKeysMainComponent } from './random-keys-main.component';

describe('RandomKeysMainComponent', () => {
  let component: RandomKeysMainComponent;
  let fixture: ComponentFixture<RandomKeysMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RandomKeysMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RandomKeysMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
