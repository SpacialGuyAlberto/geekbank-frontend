import { Component, OnInit } from '@angular/core';
import {CurrencyPipe, NgForOf, NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage,
    CurrencyPipe
  ],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
})
export class RecommendationsComponent implements OnInit {

  currentIndex = 0;

  giftCards = [
    { name: "Netflix Gift Card", price: 50, coverImage: "https://images.kinguin.net/g/card/media/images/products/_Netflix_25.jpg" },
    { name: "Amazon Gift Card", price: 100, coverImage: "https://images.kinguin.net/g/card/media/catalog/category/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/Amazon_20_1.png" },
    { name: "iTunes Gift Card", price: 25, coverImage: "https://images.kinguin.net/g/card/media/catalog/category/cache/1/hi_image/9df78eab33525d08d6e5fb8d27136e95/giftdolar-15800.png" },
    { name: "Pokemon Shield Account", price: 75, coverImage: "https://images.kinguin.net/g/card/media/catalog/category/cache/1/hi_image/9df78eab33525d08d6e5fb8d27136e95/shield_hires_1.jpg" },
  ];

  constructor() { }

  ngOnInit(): void {

    setInterval(() => {
      this.moveToNextSlide();
    }, 3000);
  }

  moveToNextSlide(): void {
    const track = document.querySelector('.carousel-track') as HTMLElement;
    const slides = document.querySelectorAll('.highlight-card') as NodeListOf<HTMLElement>;

    this.currentIndex = (this.currentIndex + 1) % slides.length;
    const amountToMove = -track.clientWidth * this.currentIndex;

    track.style.transform = `translateX(${amountToMove}px)`;
  }

  viewDetails(card: any): void {

    console.log(`Viewing details for ${card.name}`);
  }
}
