import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import {NgClass, NgIf} from "@angular/common";
import {TermsAndConditionsComponent} from "../terms-and-conditions/terms-and-conditions.component";
import {MatDialog} from "@angular/material/dialog";


@Component({
    selector: 'app-footer',
    imports: [
        NgClass,
        NgIf,
        TermsAndConditionsComponent
    ],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit, OnDestroy{
  footerClass: string = '';
  footerDivider: string = '';
  footerSection: string = '';
  contactClass: string = '50494347052';
  socialClass: string = '';
  paymentClass: string = '';
  newsletter: string = '';
  routerSubscription!: Subscription;
  termsAndConditions: boolean = false;

  constructor(private router: Router, private dialog: MatDialog){}

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
    } else if (url.includes('/login') || url.includes('/register')){
      this.footerClass = 'footer-user-details';
    }
    else {
      this.footerClass = 'footer-user-details';
    }
  }

  updateIcons(url: string): void {
    if (url.includes('/admin-panel')) {
      this.socialClass = 'social-icons-admin';
      this.paymentClass = 'payment-icons-admin'
      this.newsletter = 'newsletter-form-admin'
      this.footerDivider = 'footer-divider-admin'

      this.footerSection = 'footer-section-admin'
    } else {
      this.paymentClass = 'payment-icons-default';
      this.socialClass = 'social-icons-default';
      this.newsletter = 'newsletter-form-default';
      this.footerDivider = 'footer-divider-default'

      this.footerSection = 'footer-section-default'
    }
  }

  openTerms(): void {
    this.dialog.open(TermsAndConditionsComponent, {
      width: '600px',
      maxHeight: '80vh',
    });
  }


  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

}
