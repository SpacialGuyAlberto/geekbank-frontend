import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentSignupComponent } from './tournament-signup.component';

describe('TournamentSignupComponent', () => {
  let component: TournamentSignupComponent;
  let fixture: ComponentFixture<TournamentSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentSignupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
