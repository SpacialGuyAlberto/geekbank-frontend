// src/app/banner/banner.component.ts
import { Component, OnInit } from '@angular/core';
import {KinguinService} from "../kinguin.service";
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {CurrencyPipe, NgForOf, NgIf, NgStyle} from "@angular/common";

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  standalone: true,
  imports: [
    CurrencyPipe,
    NgIf,
    NgForOf,
    NgStyle
  ],
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {
  productId: string = '243839';
  giftCard?: KinguinGiftCard;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private kinguinService: KinguinService) {}

  ngOnInit(): void {
    this.fetchGiftCardDetails();
  }

  fetchGiftCardDetails(): void {
    this.kinguinService.getGiftCardDetails(this.productId).subscribe({
      next: (data: KinguinGiftCard) => {
        this.giftCard = data;
        this.isLoading = false;
        data.coverImageOriginal = data.images.cover?.thumbnail || '';
        data.coverImage = data.images.cover?.thumbnail || '';
        this.giftCard = data;
      },
      error: (error) => {
        console.error('Error fetching gift card details:', error);
        this.errorMessage = 'No se pudo cargar el banner en este momento.';
        this.isLoading = false;
      }
    });
  }

  getPlatforms(): string[] {
    if (!this.giftCard || !this.giftCard.platform) return [];
    // Asumiendo que 'platform' es una cadena separada por comas
    return this.giftCard.platform.split(',').map(p => p.trim());
  }

  getPlatformIcon(platform: string): string {
    // Mapeo de nombres de plataformas a rutas de iconos
    const platformMap: { [key: string]: string } = {
      'PC': 'assets/icons/pc-icon.png',
      'Xbox': 'assets/icons/xbox-icon.png',
      'PlayStation': 'assets/icons/playstation-icon.png',
      'Nintendo': 'assets/icons/nintendo-icon.png',
      'Mobile': 'assets/icons/mobile-icon.png',
      // Añade más mapeos según sea necesario
    };
    return platformMap[platform] || 'assets/icons/default-platform-icon.png';
  }
}
