import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentAnnouncementComponent } from './tournament-announcement.component';

describe('TournamentAnnouncementComponent', () => {
  let component: TournamentAnnouncementComponent;
  let fixture: ComponentFixture<TournamentAnnouncementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentAnnouncementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentAnnouncementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
