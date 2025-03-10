import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FreeFireGiftCardService} from "../services/free-fire-gift-card.service";
import {GiftCard} from "../models/GiftCard";
import {CurrencyPipe, CommonModule} from "@angular/common";
import {FreeFireDetailsComponent} from "../free-fire-details/free-fire-details.component";
import {RouterModule, Router} from "@angular/router";

@Component({
  selector: 'app-free-fire-gift-card',
  standalone: true,
  imports: [
    CurrencyPipe,
    CommonModule,
    FreeFireDetailsComponent
  ],
  templateUrl: './free-fire-gift-card.component.html',
  styleUrl: './free-fire-gift-card.component.css',
  encapsulation: ViewEncapsulation.None,
})

export class FreeFireGiftCardComponent implements OnInit{
  giftCard: GiftCard | undefined;
  showDetails: boolean = false;

  constructor(private giftCardService: FreeFireGiftCardService, private router: Router) {
  }

  ngOnInit(): void {
    this.giftCardService.getFreeFireGiftCard().subscribe((card) => {
      this.giftCard = card;
    });
  }

  navigateToDetails(): void {
    this.showDetails = true;
    this.router.navigate(['/free-fire-details'])
  }
}
