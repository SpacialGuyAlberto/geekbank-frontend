import { Component, OnInit } from '@angular/core';
import { NgForOf, NgOptimizedImage } from "@angular/common";

@Component({
  selector: 'app-highlights',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage
  ],
  templateUrl: './highlights.component.html',
  styleUrls: ['./highlights.component.css']
})
export class HighlightsComponent implements OnInit {

  highlights = [
    { title: "Garena Free Fire - 100 + 10 Diamonds CD Key", price: "€19.99", imageUrl: "https://images.kinguin.net/g/carousel-main/media/images/products/_073.jpg" },
    { title: "Genshin Impact - GeForce DLC Bundle CD Key", price: "€0.48", imageUrl: "https://images.kinguin.net/g/carousel-main/media/images/products/_blessingmoongenshinws.jpg" },
  ];

  currentIndex = 0;

  constructor() { }

  ngOnInit(): void {
    // Inicia el carrusel automático
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
}
