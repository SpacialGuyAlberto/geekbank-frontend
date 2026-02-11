import { Component } from '@angular/core';
import {NgStyle} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-tournament-announcement',
    imports: [
        NgStyle,
        RouterLink
    ],
    templateUrl: './tournament-announcement.component.html',
    styleUrl: './tournament-announcement.component.css'
})
export class TournamentAnnouncementComponent {
  days: string = '00';
  hours: string = '00';
  minutes: string = '11';
  seconds: string = '22';
  interval: any;
  tournamentDate = new Date("May 28, 2025").setHours(18, 30, 0);

  totalStock: number = 41;
  itemsLeft: number = 9;
  totalSold: number = this.totalStock - this.itemsLeft;

  ngOnInit(): void {
    this.startTimer();
  }

  startTimer(): void {

    this.interval = setInterval(() => {
      const currentTime = new Date();
      const difference = this.tournamentDate - currentTime.getTime();

      if (difference <= 0) {
        clearInterval(this.interval);
        this.days = '00';
        this.hours = '00';
        this.minutes = '00';
        this.seconds = '00';
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        this.days = this.formatTime(days)
        this.hours = this.formatTime(hours);
        this.minutes = this.formatTime(minutes);
        this.seconds = this.formatTime(seconds);
      }
    }, 1000);
  }

  formatTime(time: number): string {
    return time < 10 ? '0' + time : time.toString();
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
