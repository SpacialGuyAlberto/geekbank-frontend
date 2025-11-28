import {Component, OnInit} from '@angular/core';
import {NgStyle} from "@angular/common";
import {  FlashSaleService } from "./config/flash-sale.service";
import {HttpClient} from "@angular/common/http";
import {FlashSale} from "./config/FlashSale";

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
  flashSale: FlashSale | null = null;

  totalStock: number = 41;
  itemsLeft: number = 9;
  totalSold: number = this.totalStock - this.itemsLeft;

  constructor(
    private flashSaleService: FlashSaleService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadFlashSale();


  }

  startTimer(item: FlashSale | null): void {
    if (!item || !item.limitDate) {
      console.warn('Sin limitDate, no puedo iniciar timer');
      return;
    }

    // OJO: en el JSON viene como string "2025-11-29T20:57:38.210574"
    const targetTime = new Date(item.limitDate as any);
    console.log('TargetTime:', targetTime);

    this.interval = setInterval(() => {
      const currentTime = new Date();
      const difference = targetTime.getTime() - currentTime.getTime();

      // Solo para debug:
      // console.log('diff(ms):', difference);

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

  loadFlashSale() {
    this.flashSaleService.getAll().subscribe({
      next: data => {
        this.flashSale = data[0];
        console.log('Flash sale cargada:', this.flashSale);

        this.startTimer(this.flashSale);
      },
      error: err => {
        console.error('Error cargando flash sale', err);
      }
    });
  }

  parsePostgresTimestamp(s: string): Date {
    const [datePart, timePart] = s.split(" ");

    const [year, month, day] = datePart.split("-").map(Number);

    const [time, fraction = "0"] = timePart.split(".");
    const [hours, minutes, seconds] = time.split(":").map(Number);
    const millis = Number((fraction + "000").slice(0, 3)); // "210574" → "210" → 210 ms

    return new Date(year, month - 1, day, hours, minutes, seconds, millis);
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
