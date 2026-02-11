import { Component, Input } from '@angular/core';
import { KinguinGiftCard } from '../kinguin-gift-cards/KinguinGiftCard';
import { CurrencyPipe, NgForOf } from '@angular/common';

@Component({
    selector: 'app-gift-card-dropdown',
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

  }

  get giftCards(): KinguinGiftCard[] {
    return this._giftCards;
  }
}
