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
  contactClass: string = '';
  routerSubscription!: Subscription;

  constructor(private router: Router){}

  ngOnInit(): void {
    this.routerSubscription = this.router.events.subscribe( event => {
      if (event instanceof NavigationEnd){
        this.updateFooterClass(event.urlAfterRedirects)
      }
    });
    this.updateFooterClass(this.router.url);
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

  updateContactClass(url: string): void {
    if (url.includes('/user-details')) {
      this.contactClass = 'contact-user-details';
    } else if (url.includes('/admin-panel')) {
      this.footerClass = 'contact-admin-panel';
    } else {
      this.footerClass = 'contact-default';
    }
  }

  ngOnDestroy(): void {
    // Desuscribirse para evitar fugas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
