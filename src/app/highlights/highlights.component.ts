import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, NgForOf, NgOptimizedImage } from "@angular/common";
import { HighlightItem, HighlightItemWithGiftcard } from "../highlights-config/HighlightItem";
import { HighlightService } from "../highlights-config/highlights.service";
import { KinguinGiftCard } from "../kinguin-gift-cards/KinguinGiftCard";
import { Router } from '@angular/router';
import { firstValueFrom } from "rxjs";

@Component({
  selector: 'app-highlights',
  imports: [
    NgForOf,
    NgOptimizedImage,
    CurrencyPipe
  ],
  templateUrl: './highlights.component.html',
  styleUrls: ['./highlights.component.css']
})
export class HighlightsComponent implements OnInit {
  highlightItems: HighlightItemWithGiftcard[] = [];
  highlights: KinguinGiftCard[] = [];
  displayedHighlights: HighlightItem[] = [];

  currentIndex = 0;

  // Para la barra de progreso
  progress = 0;
  private progressInterval: any;
  private autoSlideInterval: any;

  constructor(private highlightService: HighlightService, private router: Router) { }

  ngOnInit(): void {
    this.loadHighlights();
  }

  async loadHighlights() {
    try {
      const data = await firstValueFrom(this.highlightService.getHighlights());
      this.displayedHighlights = data;
      data.map(value => {

      })

      if (!data || !Array.isArray(data)) {
        console.error('No se recibieron datos válidos para los highlights.');
        return;
      }

      this.startAutoSlide();

    } catch (error) {
      console.error('Error al cargar los highlights:', error);
    }
  }

  // Método para obtener dimensiones de una imagen
  getImageResolution(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
    });
  }
  // Inicia el carrusel automático y la barra de progreso
  startAutoSlide(): void {
    // Por si acaso hubiera un intervalo corriendo, lo limpiamos
    this.stopAutoSlide();

    // Cada 5 segundos pasamos a la siguiente imagen
    this.autoSlideInterval = setInterval(() => {
      this.moveToNextSlide();
      this.resetProgressBar();
    }, 5000);

    // Iniciamos la barra de progreso
    this.resetProgressBar();
  }

  // Detiene el carrusel automático (y la barra de progreso)
  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  // Resetea la barra de progreso a 0 y vuelve a arrancar
  resetProgressBar(): void {
    // Si había un intervalo de progreso corriendo, lo detenemos
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    this.progress = 0;
    const duration = 5000; // 5 segundos
    const stepTime = 50;   // Actualizar cada 50 ms
    const steps = duration / stepTime;
    const increment = 100 / steps;

    this.progressInterval = setInterval(() => {
      this.progress += increment;
      if (this.progress >= 100) {
        this.progress = 100;
        clearInterval(this.progressInterval);
      }
    }, stepTime);
  }

  moveToNextSlide(manual = false): void {
    if (!this.displayedHighlights.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.displayedHighlights.length;

    if (manual) {
      this.startAutoSlide();
    } else {
      this.resetProgressBar();
    }
  }

  moveToPrevSlide(manual = false): void {
    if (!this.displayedHighlights.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.displayedHighlights.length) % this.displayedHighlights.length;

    if (manual) {
      this.startAutoSlide();
    } else {
      this.resetProgressBar();
    }
  }

  viewDetails(productId: number): void {
    console.log('CARD ID: ' + productId);
    this.router.navigate(['/gift-card-details', productId]).then(success => {
      if (success) {
        console.log('Navigation successful');
      } else {
        console.log('Navigation failed');
      }
    });
  }
}
