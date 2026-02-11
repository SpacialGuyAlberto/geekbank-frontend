import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-cookie-consent',
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

  cookiePreferences = {
    analytics: false,
    ads: false,
    performance: false,
    functional: false
  };

  constructor(private cookieService: CookieService) {}

  ngOnInit(): void {
    if (!this.cookieService.check('cookieConsent')) {
      this.showBanner = true;
    } else {
      const consent = this.cookieService.get('cookieConsent');
      if (consent === 'true') {
        this.cookiePreferences = {
          analytics: true,
          ads: true,
          performance: true,
          functional: true
        };
      } else if (consent === 'false') {
        this.cookiePreferences = {
          analytics: false,
          ads: false,
          performance: false,
          functional: false
        };
      }
      else {
        try {
          this.cookiePreferences = JSON.parse(consent);
        } catch (e) {
          console.error('Error al parsear las preferencias de cookies:', e);
          this.showBanner = true;
        }
      }
    }
  }

  openCustomizeModal(): void {
    this.showCustomizeModal = true;
  }

  closeCustomizeModal(): void {
    this.showCustomizeModal = false;
  }

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

  }

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

  }

  savePreferences(): void {
    this.saveCookieConsent();
    this.showCustomizeModal = false;
    this.showBanner = false;

  }

  private saveCookieConsent(): void {
    const consentValue = JSON.stringify(this.cookiePreferences);
    this.cookieService.set('cookieConsent', consentValue, 365, '/', '', false, 'Lax');
  }
}
