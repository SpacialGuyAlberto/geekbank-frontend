import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlashSaleService } from './flash-sale.service';
import { CurrencyPipe, DatePipe, NgForOf, NgIf } from '@angular/common';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { KinguinGiftCard } from '../../kinguin-gift-cards/KinguinGiftCard';
import { FlashSale } from './models/FlashSale';
import { FlashOfferProduct, FlashOfferProductWithGiftCard } from './models/FlashOfferProduct';

@Component({
    selector: 'app-flash-sales-config',
    templateUrl: './flash-sales-config.component.html',
    imports: [
        ReactiveFormsModule,
        CurrencyPipe,
        DatePipe,
        NgForOf,
        NgIf,
        SearchBarComponent,
    ],
    styleUrls: ['./flash-sales-config.component.css']
})
export class FlashSalesConfigComponent implements OnInit {

  activeTab: 'preview' | 'config' = 'preview';

  flashForm!: FormGroup;
  modalForm!: FormGroup;

  giftCards: KinguinGiftCard[] = [];
  flashSales: FlashSale[] = [];

  flashSalesObjects: FlashOfferProductWithGiftCard[] = [];
  currentFlashOfferProduct!: FlashOfferProduct;
  currentGiftCard!: KinguinGiftCard;

  showModal = false;

  editingFlashSaleId: number | null = null;


  constructor(
    private fb: FormBuilder,
    private flashSaleService: FlashSaleService
  ) {}

  ngOnInit(): void {
    /** FORM PRINCIPAL (Flash Sale) */
    this.flashForm = this.fb.group({
      startDate: ['', Validators.required],
      limitDate: ['', Validators.required],

      stockLimit: [''],
      userLimit: [''],

      visibility: ['public', Validators.required],
      allowedCountries: [''],

      badge: ['none'],
      bannerUrl: [''],

      status: ['scheduled', Validators.required],
    });

    /** FORM MODAL (Producto) */
    this.modalForm = this.fb.group({
      newPrice: ['', [Validators.required, Validators.min(0.01)]],
    });

    this.loadFlashOffers();
  }

  loadFlashOffers(): void {
    this.flashSaleService.getAll().subscribe({
      next: data => (this.flashSales = data),
      error: err => console.error(err),
    });
  }

  /** ========== BUSCADOR ========== */
  handleSearchResults(results: KinguinGiftCard[]): void {
    this.giftCards = results;
  }

  /** ========== MODAL ========== */
  addToFlashOffer(card: KinguinGiftCard): void {
    this.currentGiftCard = card;
    this.currentFlashOfferProduct = {
      productId: card.kinguinId,
      productName: card.name,
      originalPrice: card.price,
      temporaryPrice: card.price * 0.5,
    };

    this.modalForm.patchValue({
      newPrice: this.currentFlashOfferProduct.temporaryPrice,
    });

    this.showModal = true;
  }

  addProductToFlashSale(): void {
    if (this.modalForm.invalid) return;

    this.currentFlashOfferProduct.temporaryPrice =
      this.modalForm.value.newPrice;

    this.flashSalesObjects.push({
      FlashOfferProduct: this.currentFlashOfferProduct,
      KinguinGiftCard: this.currentGiftCard,
    });

    this.showModal = false;
    this.modalForm.reset();
  }

  editOffer(offer: FlashSale): void {
    this.activeTab = 'config';
    this.editingFlashSaleId = offer.id!;

    // Cargar datos de la Flash Sale
    this.flashForm.patchValue({
      startDate: offer.createdAt,
      limitDate: offer.limitDate,
      stockLimit: offer.stockLimit,
      userLimit: offer.userLimit,
      visibility: offer.visibility,
      allowedCountries: offer.allowedCountries,
      badge: offer.badge,
      bannerUrl: offer.bannerUrl,
      status: offer.status,
    });

    // Cargar productos
    this.flashSalesObjects = offer.products.map(p => ({
      FlashOfferProduct: {
        productId: p.KinguinGiftCard.kinguinId,
        productName: p.KinguinGiftCard.name,
        originalPrice: p.KinguinGiftCard.price,
        temporaryPrice: p.KinguinGiftCard.price * 0.5,
      },
      KinguinGiftCard: {
        name: p.KinguinGiftCard.name,
        price: p.KinguinGiftCard.price,
        coverImageOriginal: p.KinguinGiftCard.coverImageOriginal,
      } as KinguinGiftCard,
    }));
  }


  closeModal(): void {
    this.showModal = false;
  }

  /** ========== GUARDAR FLASH SALE ========== */
  saveOffer(): void {
    if (this.flashForm.invalid) return;

    if (this.flashSalesObjects.length === 0) {
      alert('Debes agregar al menos un producto');
      return;
    }

    const payload = {
      ...this.flashForm.value,
      status: this.flashForm.value.status.toUpperCase(),
      products: this.flashSalesObjects.map(p => ({
        productId: p.FlashOfferProduct.productId,
        productName: p.FlashOfferProduct.productName,
        originalPrice: p.FlashOfferProduct.originalPrice,
        temporaryPrice: p.FlashOfferProduct.temporaryPrice,
      })),
    };

    const request$ = this.editingFlashSaleId
      ? this.flashSaleService.update(this.editingFlashSaleId, payload)
      : this.flashSaleService.create(payload);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.loadFlashOffers();
      },
      error: err => console.error(err),
    });
  }

  resetForm(): void {
    this.flashForm.reset({
      visibility: 'public',
      status: 'scheduled',
      badge: 'none',
    });
    this.flashSalesObjects = [];
    this.editingFlashSaleId = null;
  }


  deleteOffer(id: number): void {
    this.flashSaleService.delete(id).subscribe({
      next: () => this.loadFlashOffers(),
      error: err => console.error(err),
    });
  }
}
