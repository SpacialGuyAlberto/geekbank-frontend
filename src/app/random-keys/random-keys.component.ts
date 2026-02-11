import { Component, OnInit } from '@angular/core';
import { KinguinService } from "../kinguin-gift-cards/kinguin.service";
import { KinguinGiftCard } from "../kinguin-gift-cards/KinguinGiftCard";
import { forkJoin, Observable } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GiftCardDetailsComponent } from '../gift-card-details/gift-card-details.component';
import {CurrencyPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {OffersBannerComponent} from "../offers-banner/offers-banner.component";
import {RandomKeyMostSoldComponent} from "../random-key-most-sold/random-key-most-sold.component";
import {RandomKeysMainComponent} from "../random-keys-main/random-keys-main.component";
import {FlashSaleComponent} from "../flash-sale/flash-sale.component";

@Component({
    selector: 'app-random-keys',
    templateUrl: './random-keys.component.html',
    imports: [
        CurrencyPipe,
        MatDialogModule,
        MatProgressSpinner,
        NgForOf,
        NgIf,
        OffersBannerComponent,
        NgClass,
        RandomKeyMostSoldComponent,
        RandomKeysMainComponent,
        FlashSaleComponent,
        // otros módulos que uses en el template
    ],
    styleUrls: ['./random-keys.component.css']
})
export class RandomKeysComponent implements OnInit {

  constructor(private kinguinService: KinguinService, private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  viewDetails(key: KinguinGiftCard): void {
    // Abrir un modal con los detalles de la clave
    this.dialog.open(GiftCardDetailsComponent, {
      data: key
    });
  }

}
