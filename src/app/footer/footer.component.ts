import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import {NgClass} from "@angular/common";


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit, OnDestroy{
  footerClass: string = '';
  footerDivider: string = '';
  footerSection: string = '';
  contactClass: string = '';
  socialClass: string = '';
  paymentClass: string = '';
  newsletter: string = '';
  routerSubscription!: Subscription;


  constructor(private router: Router){}

  ngOnInit(): void {
    this.routerSubscription = this.router.events.subscribe( event => {
      if (event instanceof NavigationEnd){
        this.updateFooterClass(event.urlAfterRedirects);
        this.updateIcons(this.router.url)
      }
    });
    this.updateFooterClass(this.router.url);
    this.updateIcons(this.router.url)
  }

  updateFooterClass(url: string): void {
    if (url.includes('/user-details')) {
      this.footerClass = 'footer-user-details';
    } else if (url.includes('/admin-panel')) {
      this.footerClass = 'footer-admin-panel';
    } else {
      this.footerClass = 'footer-default';
    }
  }

  updateIcons(url: string): void {
    if (url.includes('/admin-panel')) {
      this.socialClass = 'social-icons-admin';
      this.paymentClass = 'payment-icons-admin'
      this.newsletter = 'newsletter-form-admin'
      this.footerDivider = 'footer-divider-admin'
      // this.contactClass = 'contact-info-admin'
      this.footerSection = 'footer-section-admin'
    } else {
      this.paymentClass = 'payment-icons-default';
      this.socialClass = 'social-icons-default';
      this.newsletter = 'newsletter-form-default';
      this.footerDivider = 'footer-divider-default'
      // this.contactClass = 'contact-info-default';
      this.footerSection = 'footer-section-default'
    }
  }

  ngOnDestroy(): void {
    // Desuscribirse para evitar fugas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
