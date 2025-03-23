import { Component, OnInit } from '@angular/core';
import { NgForOf, NgOptimizedImage } from "@angular/common";
import { HighlightItemWithGiftcard } from "../highlights-config/HighlightItem";
import { HighlightService } from "../highlights-config/highlights.service";
import { KinguinGiftCard } from "../kinguin-gift-cards/KinguinGiftCard";
import { Router } from '@angular/router';
import { firstValueFrom } from "rxjs";

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
      // Obtener los datos de highlights usando firstValueFrom
      const data = await firstValueFrom(this.highlightService.getHighlights());

      // Verificar que data no sea undefined, ni null y que sea un array
      if (!data || !Array.isArray(data)) {
        console.error('No se recibieron datos válidos para los highlights.');
        return;
      }

      for (const item of data) {
        const giftcard = item.giftcard;

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

        const uniqueImageUrls = Array.from(new Set(imageUrls));

        const imagePromises = uniqueImageUrls.map(url =>
          this.getImageResolution(url)
            .then(res => ({ url, resolution: res.width * res.height}))
            .catch(err => {
              console.error(`Error al cargar la imagen ${url}:`, err);
              return { url, resolution: 0 }; // Considerar resolución 0 si falla
            })
        );

        const results = await Promise.all(imagePromises);


        const validImages = results
          .filter(img => img.resolution > 0)
          .sort((a, b) => b.resolution - a.resolution);

        // Asignar la mejor imagen disponible
        if (validImages.length > 0) {
          giftcard.selectedImage = validImages[0].url;
          console.log(validImages);
        } else {
          giftcard.selectedImage = '';
          console.warn(`No se encontró una imagen válida para el giftcard: ${giftcard.name}`);
        }

        this.highlights.push(giftcard);
      }

      // Iniciar el carrusel automático (ahora que ya tenemos los slides)
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

    // Cada 3 segundos pasamos a la siguiente imagen
    this.autoSlideInterval = setInterval(() => {
      this.moveToNextSlide();
      this.resetProgressBar();
    }, 3000);

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
    const duration = 3000; // 3 segundos
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

  // Ir al siguiente slide
  moveToNextSlide(): void {
    const track = document.querySelector('.carousel-track') as HTMLElement;
    const slides = document.querySelectorAll('.highlight-card') as NodeListOf<HTMLElement>;

    if (!track || slides.length === 0) return;

    this.currentIndex = (this.currentIndex + 1) % slides.length;
    const amountToMove = -track.clientWidth * this.currentIndex;
    track.style.transform = `translateX(${amountToMove}px)`;
  }

  // Ir al slide anterior
  moveToPrevSlide(): void {
    const track = document.querySelector('.carousel-track') as HTMLElement;
    const slides = document.querySelectorAll('.highlight-card') as NodeListOf<HTMLElement>;

    if (!track || slides.length === 0) return;

    // Si estamos en el primer slide (index = 0), volvemos al último.
    this.currentIndex = (this.currentIndex - 1 + slides.length) % slides.length;
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
