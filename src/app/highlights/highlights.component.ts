import { Component, OnInit } from '@angular/core';
import { NgForOf, NgOptimizedImage } from "@angular/common";
import {HighlightItemWithGiftcard} from "../models/HighlightItem";
import {HighlightService} from "../highlights.service";
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import { Router } from '@angular/router';

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
  highlightItems: HighlightItemWithGiftcard[] = [];
  highlights: KinguinGiftCard[] = [];

  currentIndex = 0;

  constructor(private highlightService: HighlightService, private router: Router) { }

  ngOnInit(): void {
    this.loadHighlights();
    setInterval(() => {
      this.moveToNextSlide();
    }, 3000);
  }

  loadHighlights(){
    this.highlightService.getHighlights().subscribe(data =>
      data.map( item => this.highlights.push(item.giftcard)),
    );

    this.highlightService.getHighlights().subscribe(data =>
      data.map( item =>console.log( item.giftcard)),
    );
  }

  moveToNextSlide(): void {
    const track = document.querySelector('.carousel-track') as HTMLElement;
    const slides = document.querySelectorAll('.highlight-card') as NodeListOf<HTMLElement>;

    this.currentIndex = (this.currentIndex + 1) % slides.length;
    const amountToMove = -track.clientWidth * this.currentIndex;

    track.style.transform = `translateX(${amountToMove}px)`;
  }

  viewDetails(card: KinguinGiftCard): void {
    console.log('CARD ID: ' + card.productId);
    this.router.navigate(['/gift-card-details', card.kinguinId]).then(success => {
      if (success) {
        console.log('Navigation successful');
      } else {
        console.log('Navigation failed');
      }
    });
  }
}
