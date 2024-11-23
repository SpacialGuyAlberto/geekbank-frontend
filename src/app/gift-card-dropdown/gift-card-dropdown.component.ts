// src/app/components/gift-card-dropdown/gift-card-dropdown.component.ts
import { Component, Input } from '@angular/core';
import { KinguinGiftCard } from '../models/KinguinGiftCard';
import { CurrencyPipe, NgForOf } from '@angular/common';

@Component({
  selector: 'app-gift-card-dropdown',
  standalone: true,
  imports: [
    NgForOf,
    CurrencyPipe
  ],
  templateUrl: './gift-card-dropdown.component.html',
  styleUrls: ['./gift-card-dropdown.component.css']
})
export class GiftCardDropdownComponent {
  private _giftCards: KinguinGiftCard[] = [];

  @Input() set giftCards(value: KinguinGiftCard[]) {
    this._giftCards = value;
    console.log('Gift Cards recibidas en Dropdown:', this._giftCards);
  }

  get giftCards(): KinguinGiftCard[] {
    return this._giftCards;
  }
}
