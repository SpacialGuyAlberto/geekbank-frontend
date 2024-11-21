import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.css']
})
export class CookieConsentComponent implements OnInit {

  showBanner: boolean = false;
  showCustomizeModal: boolean = false;

  // Objeto para almacenar las preferencias de cookies
  cookiePreferences = {
    analytics: false,
    ads: false,
    performance: false,
    functional: false
  };

  constructor(private cookieService: CookieService) {}

  ngOnInit(): void {
    // Mostrar el banner solo si la cookie 'cookieConsent' no está establecida
    if (!this.cookieService.check('cookieConsent')) {
      this.showBanner = true;
    } else {
      // Leer las preferencias si existen
      const consent = this.cookieService.get('cookieConsent');
      if (consent === 'true') {
        // Aceptar todas las cookies
        this.cookiePreferences = {
          analytics: true,
          ads: true,
          performance: true,
          functional: true
        };
      } else if (consent === 'false') {
        // Rechazar todas las cookies
        this.cookiePreferences = {
          analytics: false,
          ads: false,
          performance: false,
          functional: false
        };
      }
      // Si la cookie tiene un formato JSON con preferencias específicas, parsearlo
      else {
        try {
          this.cookiePreferences = JSON.parse(consent);
        } catch (e) {
          console.error('Error al parsear las preferencias de cookies:', e);
          // Si hay un error, mostrar el banner
          this.showBanner = true;
        }
      }
    }
  }

  // Abrir el modal de personalización
  openCustomizeModal(): void {
    this.showCustomizeModal = true;
  }

  // Cerrar el modal de personalización
  closeCustomizeModal(): void {
    this.showCustomizeModal = false;
  }

  // Aceptar todas las cookies
  acceptAllCookies(): void {
    this.cookiePreferences = {
      analytics: true,
      ads: true,
      performance: true,
      functional: true
    };
    this.saveCookieConsent();
    this.showBanner = false;
    this.showCustomizeModal = false;
    console.log('Todas las cookies aceptadas');
  }

  // Rechazar todas las cookies
  rejectAllCookies(): void {
    this.cookiePreferences = {
      analytics: false,
      ads: false,
      performance: false,
      functional: false
    };
    this.saveCookieConsent();
    this.showBanner = false;
    this.showCustomizeModal = false;
    console.log('Todas las cookies rechazadas');
  }

  // Guardar las preferencias seleccionadas
  savePreferences(): void {
    this.saveCookieConsent();
    this.showCustomizeModal = false;
    this.showBanner = false;
    console.log('Preferencias de cookies guardadas:', this.cookiePreferences);
  }

  // Función para guardar el consentimiento en una cookie
  private saveCookieConsent(): void {
    // Convertir las preferencias a una cadena JSON
    const consentValue = JSON.stringify(this.cookiePreferences);
    // Establecer la cookie con las preferencias
    this.cookieService.set('cookieConsent', consentValue, 365, '/', '', false, 'Lax');
  }
}
