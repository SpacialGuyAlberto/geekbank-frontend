// src/app/components/offers-banner/offers-banner.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Importar Router
import { NgForOf, NgIf } from '@angular/common';

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
      imageUrl: 'https://storage.googleapis.com/api-ecommerce/minecraft_cover_original.jpg',
      title: 'Minecraft',
      link: '/#'
    },
    {
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BZmQwMjQ2ZTUtZmM5MC00MTdkLWIxYzgtODU1NzQ4Zjg4NmMxXkEyXkFqcGc@._V1_.jpg',
      title: 'Valorant',
      link: '#'
    },
    {
      imageUrl: 'https://static.kinguin.net/media/images/products/_A1fWQYTIc3L._FMwebp_.jpg',
      title: 'Roblox',
      link: '#'
    },
    {
      imageUrl: 'https://storage.googleapis.com/api-ecommerce/ea-sports-fc-25_cover_original.jpg',
      title: 'FC 26',
      link: '#'
    },
    {
      imageUrl: 'https://storage.googleapis.com/api-ecommerce/the-witcher-2-assassins-of-kings-enhanced-edition_cover_original.jpg',
      title: 'The witcher',
      link: '#'
    },
    {
      imageUrl: 'https://storage.googleapis.com/api-ecommerce/dmc-devil-may-cry_cover_original.jpg',
      title: 'devil may cry',
      link: '#'
    },
  ];

  isModalOpen: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  goToOfferDetails(offer: Offer): void {
    // Navegar a la ruta '/offer/{title}'
    this.router.navigate(['/offer', encodeURIComponent(offer.title)]);
  }

}
