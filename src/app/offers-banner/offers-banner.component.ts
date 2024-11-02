// src/app/offers-banner/offers-banner.component.ts
import { Component, OnInit } from '@angular/core';
import {NgForOf} from "@angular/common";

interface Offer {
  imageUrl: string;
  title: string;
  link: string;
}

@Component({
  selector: 'app-offers-banner',
  templateUrl: './offers-banner.component.html',
  standalone: true,
  imports: [
    NgForOf
  ],
  styleUrls: ['./offers-banner.component.css']
})
export class OffersBannerComponent implements OnInit {

  offers: Offer[] = [
    {
      imageUrl: 'https://images.g2a.com/300x400/1x1x1/garena-free-fire-100-10-diamond-key-global-i10000218624005/5f6090f97e696c046b0ffe22',
      title: 'Garena Free Fire',
      link: '#'
    },
    {
      imageUrl: 'https://i.pinimg.com/474x/87/91/63/879163b9179cee01973ff32fb6906c66.jpg',
      title: 'Call of Duty Mobile',
      link: '#'
    },
    {
      imageUrl: 'https://wallpapercave.com/wp/wp7663569.jpg',
      title: 'Juego 3',
      link: '#'
    },
    {
      imageUrl: 'https://play-lh.googleusercontent.com/fRFOz7hD7C0r4b6Dity3muFFPm90gXPiVKAHNyJvPHA6Y__Qdi05lnsbeylGtUylJQ=w240-h480-rw',
      title: 'Juego 4',
      link: '#'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
