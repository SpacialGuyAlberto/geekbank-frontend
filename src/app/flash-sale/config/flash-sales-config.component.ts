import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { FlashSaleService} from "./flash-sale.service";
import {CurrencyPipe, DatePipe, DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {SearchBarComponent} from "../../search-bar/search-bar.component";
import {KinguinGiftCard} from "../../kinguin-gift-cards/KinguinGiftCard";
import {HighlightItem} from "../../highlights-config/HighlightItem";

interface FlashOffer {
  id?: number;
  productId: number;

  // Precios
  originalPrice: number;
  temporaryPrice: number;

  // Fechas
  startDate: string;
  limitDate: string;

  // Límites
  stockLimit?: number;
  userLimit?: number;

  // Visibilidad
  visibility: 'public' | 'hidden' | 'restricted';
  allowedCountries?: string;

  // Marketing
  badge?: string;
  bannerUrl?: string;

  // Estado
  status: 'scheduled' | 'active' | 'paused';
}


@Component({
  selector: 'app-flash-sales-config',
  templateUrl: './flash-sales-config.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    NgForOf,
    SearchBarComponent,
    NgIf,
    DecimalPipe
  ],
  styleUrls: ['./flash-sales-config.component.css']
})
export class FlashSalesConfigComponent implements OnInit {
  giftCards: KinguinGiftCard[] = [];
  flashForm!: FormGroup;
  flashOffers: FlashOffer[] = []
  activeTab: 'search' | 'config' = 'search';


  constructor(
    private fb: FormBuilder,
    private flashSaleService: FlashSaleService
  ) {}

  ngOnInit() {
    this.flashForm = this.fb.group({
      productId: ['', Validators.required],
      originalPrice: ['', Validators.required],
      temporaryPrice: ['', Validators.required],

      startDate: ['', Validators.required],
      limitDate: ['', Validators.required],

      stockLimit: [''],          // opcional
      userLimit: [''],           // opcional

      visibility: ['public', Validators.required],
      allowedCountries: [''],    // solo si visibility == restricted

      badge: ['none'],
      bannerUrl: [''],

      status: ['scheduled', Validators.required],
    });

    this.loadFlashOffers();
  }


  loadFlashOffers() {
    this.flashSaleService.getAll().subscribe({
      next: (data) => (this.flashOffers = data),
      error: (err) => console.error(err),
    });
  }

  createOffer() {
    if (this.flashForm.valid) {
      this.flashSaleService.create(this.flashForm.value).subscribe({
        next: () => {
          this.flashForm.reset();
          this.loadFlashOffers();
        },
        error: (err) => console.error(err),
      });
    }
  }

  deleteOffer(id: number) {
    this.flashSaleService.delete(id).subscribe({
      next: () => this.loadFlashOffers(),
      error: (err) => console.error(err),
    });
  }

  handleSearchResults(results: KinguinGiftCard[]): void {
    this.giftCards = results;
  }
}
