import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KinguinService } from '../kinguin.service';
import { KinguinGiftCard } from '../models/KinguinGiftCard';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inferior-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inferior-filter.component.html',
  styleUrls: ['./inferior-filter.component.css']
})
export class InferiorFilterComponent {
  /**
   * Al emitir este evento, el padre (contenedor de este componente)
   * puede recibir los Gift Cards filtrados.
   */
  @Output() filteredResults = new EventEmitter<KinguinGiftCard[]>();

  /**
   * Aquí puedes añadir o quitar las plataformas que desees.
   * Si tienes imágenes de íconos, podrías incluir su ruta en un atributo `icon`.
   */
  platforms = [
    { name: 'Steam', icon: 'assets/steam.jpg' },
    { name: 'PlayStation 4', icon: 'assets/play4.png' },
    { name: 'PlayStation 5', icon: 'assets/ps5.png' },
    { name: 'Nintendo', icon: 'assets/nintendo-thumb.png' },
    { name: 'PlayStation 3', icon: 'assets/ps3.jpg' },
    { name: 'Battle.net', icon: 'assets/battle.avif' },
    { name: 'Android', icon: 'assets/androidsvg.svg' },
    { name: 'PlayStation Vita', icon: 'assets/ps-vita.png' },
    { name: 'NCSOFT', icon: 'assets/ncsoft.jpg' },
    { name: 'Rockstar Games', icon: 'assets/rock-stars.png' },
    { name: 'MOG Station', icon: 'assets/mog-station.png' },
    { name: 'Epic Games', icon: 'assets/epic-games.png' },
    { name: 'MS Store (PC)', icon: 'assets/ms-store.webp' },
    { name: 'Meta Quest', icon: 'assets/meta.svg' },
    { name: 'Meta Quest 2', icon: 'assets/meta.svg' },
    { name: 'Meta Quest PRO', icon: 'assets/meta.svg' },
    { name: 'Nintendo Switch', icon: 'assets/Nintendo_Switch_logo,_square.png' },
    { name: 'Origin / EA app', icon: 'assets/origin-logo.pnh.png' },
    { name: 'PC', icon: 'assets/desktop-solid.svg' },
    { name: 'PlayStation', icon: 'assets/ps-logo.png' },
    { name: 'Ubisoft', icon: 'assets/ubisoft.png' },
    { name: 'XBOX', icon: 'assets/xbox.png' },
    { name: 'Xbox One', icon: 'assets/xbox.png' },
    { name: 'Xbox 360', icon: 'assets/xbox-360.png' },
    { name: 'XBOX LIVE Gold Card', icon: 'assets/xbox-live-gold.jpg' },
    // etc...
  ];

  constructor(
    private kinguinService: KinguinService,
    private router: Router
  ) {}

  /**
   * Función que se llama cuando el usuario hace clic en una
   * plataforma. Construye un objeto de filtros simple y
   * llama al servicio para obtener los gift cards filtrados.
   */
  applyPlatformFilter(platformName: string): void {
    const filters = { platform: platformName };
    this.kinguinService.getFilteredGiftCards(filters).subscribe({
      next: (giftCards: KinguinGiftCard[]) => {
        this.filteredResults.emit(giftCards);
      },
      error: (err) => {
        console.error('Error obteniendo gift cards filtrados:', err);
      }
    });
  }


  goToPlatform(platformName: string): void {
    // Navega a la ruta '/platform/platformName'
    this.router.navigate(['/platform', platformName])
      .then(success => {
        if (!success) {
          console.error('Navegación fallida');
        }
      });
  }

}
