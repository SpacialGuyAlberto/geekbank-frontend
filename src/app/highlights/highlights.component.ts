import { Component, OnInit } from '@angular/core';
import { NgForOf, NgOptimizedImage } from "@angular/common";
import {HighlightItemWithGiftcard} from "../models/HighlightItem";
import {HighlightService} from "../highlights.service";
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import { Router } from '@angular/router';
import {firstValueFrom} from "rxjs";

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

  async loadHighlights() {
    try {
      // Obtener los datos de highlights usando firstValueFrom
      const data = await firstValueFrom(this.highlightService.getHighlights());

      // Verificar que data no sea undefined ni null y que sea un array
      if (!data || !Array.isArray(data)) {
        console.error('No se recibieron datos válidos para los highlights.');
        return;
      }

      for (const item of data) {
        const giftcard = item.giftcard;

        // Obtener todas las URLs de imágenes disponibles
        const imageUrls: string[] = [];
        if (giftcard.coverImageOriginal) {
          imageUrls.push(giftcard.coverImageOriginal);
        }
        if (giftcard.images.cover?.thumbnail) {
          imageUrls.push(giftcard.images.cover.thumbnail);
        }
        if (giftcard.screenshots && giftcard.screenshots.length > 0) {
          imageUrls.push(...giftcard.screenshots.map(screenshot => screenshot.url));
        }

        // Eliminar duplicados
        const uniqueImageUrls = Array.from(new Set(imageUrls));

        // Cargar todas las imágenes y obtener sus resoluciones
        const imagePromises = uniqueImageUrls.map(url =>
          this.getImageResolution(url)
            .then(res => ({ url, resolution: res.width * res.height }))
            .catch(err => {
              console.error(`Error al cargar la imagen ${url}:`, err);
              return { url, resolution: 0 }; // Considerar resolución 0 si falla
            })
        );

        const results = await Promise.all(imagePromises);

        // Filtrar imágenes válidas y ordenar por resolución descendente
        const validImages = results
          .filter(img => img.resolution > 0)
          .sort((a, b) => b.resolution - a.resolution);

        // Asignar la mejor imagen disponible
        if (validImages.length > 0) {
          giftcard.selectedImage = validImages[0].url;
        } else {
          // Si no hay imágenes válidas, asigna una cadena vacía o maneja según tus necesidades
          giftcard.selectedImage = ''; // Asigna una cadena vacía
          console.warn(`No se encontró una imagen válida para el giftcard: ${giftcard.name}`);
        }

        this.highlights.push(giftcard);
      }

      // Opcional: Imprimir en consola para depuración
      this.highlights.forEach(giftcard => console.log(giftcard));
    } catch (error) {
      console.error('Error al cargar los highlights:', error);
    }
  }
  // register.component.ts
  getImageResolution(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
    });
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
