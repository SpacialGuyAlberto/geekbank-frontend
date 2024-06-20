
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {KinguinService} from "../kinguin.service";
import {KinguinGiftCard} from "../models/KinguinGiftCard";
import {CurrencyPipe} from "@angular/common";
import {CommonModule} from "@angular/common";
import { Router } from '@angular/router';

@Component({
  selector: 'app-gift-card-details',
  standalone: true,
  imports: [
    CurrencyPipe,
    CommonModule
  ],
  templateUrl: './gift-card-details.component.html',
  styleUrl: './gift-card-details.component.css'
})
export class GiftCardDetailsComponent implements OnInit {
  giftCard: KinguinGiftCard | undefined;

  constructor(private route: ActivatedRoute, private kinguinService: KinguinService, private router: Router) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.kinguinService.getGiftCardDetails(id).subscribe(data => {
        if (!data.coverImageOriginal || !data.coverImage) {
          data.coverImageOriginal = data.images.cover?.thumbnail || '';
          data.coverImage = data.images.cover?.thumbnail || '';
        }
        this.giftCard = data;
        console.log('COVER OF IMAGE: ' + data.coverImageOriginal);
      });
    }
  }

  addToCart(giftCard: KinguinGiftCard): void {
    // Implement add to cart functionality
    console.log('Added to cart:', this.giftCard)
  }

  buyNow(giftCard: KinguinGiftCard): void {
    // Implement buy now functionality
    console.log('Bought now:', this.giftCard);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
