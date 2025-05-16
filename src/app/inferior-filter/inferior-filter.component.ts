import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KinguinService } from '../kinguin-gift-cards/kinguin.service';
import { KinguinGiftCard } from '../kinguin-gift-cards/KinguinGiftCard';
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
    { name: 'Nintendo', icon: 'assets/nintendo.png' },
    { name: 'PlayStation 3', icon: 'assets/PS3.png' },
    { name: 'Battle.net', icon: 'assets/battlenet.png' },
    { name: 'Android', icon: 'assets/android1.png' },
    { name: 'PlayStation Vita', icon: 'assets/PSvita.png' },
    { name: 'NCSOFT', icon: 'assets/ncsoft.jpg' },
    { name: 'Rockstar Games', icon: 'assets/rock-stars.png' },
    { name: 'MOG Station', icon: 'assets/mogstation.png' },
    { name: 'Epic Games', icon: 'assets/epic-games.png' },
    { name: 'MS Store (PC)', icon: 'assets/ms-store.webp' },
    { name: 'Meta Quest', icon: 'assets/meta.png' },
    { name: 'Meta Quest 2', icon: 'assets/meta.png' },
    { name: 'Meta Quest PRO', icon: 'assets/meta.png' },
    { name: 'Nintendo Switch', icon: 'assets/Nintendo_Switch_logo,_square.png' },
    { name: 'Origin / EA app', icon: 'assets/origin-logo.pnh.png' },
    { name: 'PC', icon: 'assets/pc.png' },
    { name: 'PlayStation', icon: 'assets/playstation.png' },
    { name: 'Ubisoft', icon: 'assets/ubisoft.png' },
    { name: 'XBOX', icon: 'assets/xbox.png' },
    { name: 'Xbox One', icon: 'assets/xboxone.png' },
    { name: 'Xbox 360', icon: 'assets/xbox360.png' },
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
    this.router.navigate(['/platform', platformName])
      .then(success => {
        if (!success) {
          console.error('Navegación fallida');
        }
      });
  }

}
