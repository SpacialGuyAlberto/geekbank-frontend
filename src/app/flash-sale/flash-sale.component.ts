import {Component, OnInit} from '@angular/core';
import {NgStyle} from "@angular/common";

@Component({
  selector: 'app-flash-sale',
  standalone: true,
  imports: [
    NgStyle
  ],
  templateUrl: './flash-sale.component.html',
  styleUrl: './flash-sale.component.css'
})
export class FlashSaleComponent implements OnInit {
  hours: string = '00';
  minutes: string = '11';
  seconds: string = '22';
  interval: any;

  totalStock: number = 41;
  itemsLeft: number = 9;
  totalSold: number = this.totalStock - this.itemsLeft;

  ngOnInit(): void {
    this.startTimer();
  }

  startTimer(): void {
    const targetTime = new Date();
    targetTime.setMinutes(targetTime.getMinutes() + 11);
    targetTime.setSeconds(targetTime.getSeconds() + 22);

    this.interval = setInterval(() => {
      const currentTime = new Date();
      const difference = targetTime.getTime() - currentTime.getTime();

      if (difference <= 0) {
        clearInterval(this.interval);
        this.hours = '00';
        this.minutes = '00';
        this.seconds = '00';
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

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
