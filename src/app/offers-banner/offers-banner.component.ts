import { Component, OnInit } from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";

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
    NgForOf,
    NgIf
  ],
  styleUrls: ['./offers-banner.component.css']
})
export class OffersBannerComponent implements OnInit {

  offers: Offer[] = [
    {
      imageUrl: 'https://images.g2a.com/300x400/1x1x1/garena-free-fire-100-10-diamond-key-global-i10000218624005/5f6090f97e696c046b0ffe22',
      title: 'Garena Free Fire',
      link: '/free-fire-details'
    },
    {
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzpFwx2_B4AmweuLUjGiYnENPtRMP9siWsOxjNIoRzjI-WVlcdzXDDz0LSu8bUsZYRIAI&usqp=CAU',
      title: 'Pub G',
      link: '#'
    },
    {
      imageUrl: 'https://static.kinguin.net/media/images/products/_genshimpblessing1.jpg',
      title: 'Juego 3',
      link: '#'
    },
    {
      imageUrl: 'https://storage.googleapis.com/api-ecommerce/ea-sports-fc-25_cover_original.jpg',
      title: 'Juego 4',
      link: '#'
    },
  ];

  isModalOpen: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

}
