import { Component, OnInit } from '@angular/core';
import {FreeFireGiftCardService} from "../free-fire-gift-card.service";
import {GiftCard} from "../models/GiftCard";
import {CurrencyPipe, CommonModule} from "@angular/common";

@Component({
  selector: 'app-free-fire-gift-card',
  standalone: true,
  imports: [
    CurrencyPipe,
    CommonModule
  ],
  templateUrl: './free-fire-gift-card.component.html',
  styleUrl: './free-fire-gift-card.component.css'
})

export class FreeFireGiftCardComponent implements OnInit{
  giftCard: GiftCard | undefined;

  constructor(private giftCardService: FreeFireGiftCardService) {
  }

  ngOnInit(): void {
    this.giftCardService.getFreeFireGiftCard().subscribe((card) => {
      this.giftCard = card;
    });
  }

}
