// import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
// import { KinguinGiftCard } from "../models/KinguinGiftCard";
// import { CurrencyPipe } from "@angular/common";
//
// @Component({
//   selector: 'app-gift-card',
//   template: `
//     <div class="gift-card">
//       <img [src]="card.coverImageOriginal" alt="{{ card.name }}" class="gift-card-image" loading="lazy">
//       <div class="gift-card-content">
//         <h3 class="gift-card-title">{{ card.name }}</h3>
//         <p class="gift-card-price">{{ card.price | currency:'HNL':'symbol':'1.2-2' }}</p>
//       </div>
//     </div>
//   `,
//   styles: [/* tus estilos aquí */],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   standalone: true,
//   imports: [CurrencyPipe]
// })
// export class GiftCardComponent {
//   @Input() card!: KinguinGiftCard;
// }
//
