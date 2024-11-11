import {Component, EventEmitter, Injector, Input, OnInit, Output, StaticProvider} from '@angular/core';
import { PaymentService } from "../payment.service";
import { TigoPaymentComponent } from '../tigo-payment/tigo-payment.component';
import { PaymentOptionsComponent } from "../payment-options/payment-options.component";
import { NgComponentOutlet, NgIf } from "@angular/common";
import {CART_ITEMS, GAME_USER_ID, PRODUCT_ID, TOTAL_PRICE} from "./payment.token";
import {TigoService} from "../tigo.service";
import {TigoPaymentService} from "../tigo-payment.service";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  standalone: true,
  imports: [
    PaymentOptionsComponent,
    NgComponentOutlet,
    NgIf
  ],
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit{
  selectedMethod: string | null = null;
  selectedMethodComponent: any = null;
  showPaymentOptions: boolean = true;

  @Input() cartItems: any[] = [];
  @Input() totalPrice: number = 0;
  @Input() productId: number | null = null;
  @Input() gameUserId: number | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() paymentSelected = new EventEmitter<string>();

  paymentMethods = [
    { value: 'paypal', label: 'PayPal' },
    { value: 'creditCard', label: 'Tarjeta de Crédito' },
    { value: 'bitcoin', label: 'Bitcoin' },
    { value: 'tigo', label: 'Tigo Money' },
    { value: 'balance', label: 'Balance en cuenta' }
  ];

  constructor(private paymentService: PaymentService,
              protected injector: Injector,
              private tigoPaymentService: TigoPaymentService

  ) {}

  createInjector(): Injector {
    const providers: StaticProvider[] = [
      { provide: CART_ITEMS, useValue: this.cartItems || [] }, // Valor predeterminado
      { provide: TOTAL_PRICE, useValue: this.totalPrice || 0 },
      { provide: PRODUCT_ID, useValue: this.productId },
      { provide: GAME_USER_ID, useValue: this.gameUserId }
    ];
    return Injector.create({ providers, parent: this.injector });
  }

  onPaymentSelected(method: string) {
    this.selectedMethod = method;
    this.showPaymentOptions = false;
    this.loadPaymentComponent(method);
  }

  loadPaymentComponent(method: string) {
    switch (method) {
      case 'Tigo Money':
        this.selectedMethodComponent = TigoPaymentComponent;
        this.injector = this.createInjector();
        console.log('Injector' + this.injector);
        break;
      case 'paypal':
        // this.selectedMethodComponent = PaypalPaymentComponent;
        break;
      case 'creditCard':
        // this.selectedMethodComponent = CreditCardPaymentComponent;
        break;
      case 'bitcoin':
        // this.selectedMethodComponent = BitcoinPaymentComponent;
        break;
      case 'balance':
        // this.selectedMethodComponent = BalancePaymentComponent;
        break;
      default:
        this.selectedMethodComponent = null;
    }
  }

  closePaymentModal() {}

  close() {
    this.closeModal.emit();
  }

  ngOnInit(): void {
    this.paymentService.registerPaymentMethod('tigo', this.tigoPaymentService);
  }
}
