import { Component, OnInit } from '@angular/core';
import { NgForOf, NgOptimizedImage } from "@angular/common";
import {HighlightItemWithGiftcard} from "../models/HighlightItem";
import {HighlightService} from "../highlights.service";
import {KinguinGiftCard} from "../models/KinguinGiftCard";

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

  constructor(private highlightService: HighlightService) { }

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
}
