import {Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {CurrencyPipe, NgForOf, NgIf} from '@angular/common';
import { Subscription } from 'rxjs';
import { OrderService } from '../services/order.service';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { AccountService } from '../account.service';
import { OrderRequest } from '../models/order-request.model';
import { Account } from '../user-details/User';
import {before} from "node:test";
import { Router } from '@angular/router';
import {CART_ITEMS, GAME_USER_ID, IS_MANUAL_TRANSACTION, PRODUCT_ID, TOTAL_PRICE} from "../payment/payment.token";

@Component({
  selector: 'app-balance-payment',
  standalone: true,
  imports: [FormsModule, NgIf, CurrencyPipe, NgForOf],
  templateUrl: './balance-payment.component.html',
  styleUrls: ['./balance-payment.component.css'],
})
export class BalancePaymentComponent implements OnInit, OnDestroy {
  @Input() userId: number | null = null;
  @Input() phoneNumber: string = '';
  cartItems = inject(CART_ITEMS, { optional: true }) || [];
  totalPrice = inject(TOTAL_PRICE, { optional: true }) || 0;
  productId = inject(PRODUCT_ID, { optional: true });
  gameUserId = inject(GAME_USER_ID, { optional: true });
  isManualTransaction = inject(IS_MANUAL_TRANSACTION);
  @Output() close = new EventEmitter<void>();
  id: string | null = null;
  benutzerId: number = 0;
  account: Account | null = null;
  isLoading: boolean = false;
  showSpinner: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  notifMessage: string = '';
  transactionStatus: string = '';
  isCancelling: boolean = false;
  orderRequestNumber: string = '';
  showModal: boolean = true;
  orderRequest: OrderRequest | undefined = undefined;
  private accountSubscription: Subscription | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private accountService: AccountService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = sessionStorage.getItem('userId');
    if (this.id){
      this.benutzerId = parseInt(this.id, 10)
      this.userId = this.benutzerId;
      this.loadAccount();
    }
    console.log('Received product ID:', this.productId?.toString());
    console.log('Received total price: ', this.totalPrice);
  }

  loadAccount(): void {
    if (this.authService.isLoggedIn()){
      this.authService.getUserDetails().subscribe(data => {
        this.account = data.account;
        console.log(data.email)
        sessionStorage.setItem("email", data.email)
      });
    }
  }

  handlePurchase(): void {

    if (!this.userId) {
      this.errorMessage = 'Usuario no autenticado.';
      return;
    }

    if (this.productId !== null){
        this.orderRequest = {
          userId: this.userId,
          phoneNumber: this.phoneNumber,
          products: [{
            kinguinId: this.productId,
            qty: 1,
            price: this.totalPrice,
            name: 'Producto'
          }],
          amount: this.totalPrice,
          manual: this.isManualTransaction
        }
    } else {
      this.orderRequest = {
        userId: this.userId,
        phoneNumber: this.phoneNumber,
        products: this.cartItems.map((item) => ({
          kinguinId: item.cartItem.productId,
          qty: item.cartItem.quantity,
          price: item.giftcard.price,
          name: item.giftcard.name,
        })),
        amount: this.totalPrice,
        manual: false,
      };
    }

    this.showSpinner = true;

    this.orderService.purchaseWithBalance(this.orderRequest).subscribe({
      next: (response) => {
        this.successMessage = 'Compra realizada exitosamente.';
        this.notifMessage = 'Tu compra fue completada con tu balance.';
        this.showSpinner = false;
        this.close.emit();
        this.router.navigate(['/purchase-confirmation'], {
          queryParams: {
            orderRequestNumber: response.orderRequestNumber,
            transactionNumber: response.transactionNumber,
            transactionStatus: response.transactionStatus,
            tempPin: response.tempPin,
          },
        });
      },
      error: (err) => {
        console.error('Error during purchase:', err);
        this.errorMessage = 'Error al procesar la compra. Inténtalo de nuevo.';
        this.showSpinner = false;
      },
    });
  }

  cancelPurchase(): void {
    this.isCancelling = true;
    this.showSpinner = true;

    setTimeout(() => {
      this.isCancelling = false;
      this.showSpinner = false;
      this.close.emit();
    }, 1000);
  }

  closeModal(): void {
    this.close.emit();
    this.showModal = !this.showModal;
  }

  ngOnDestroy(): void {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
  }
}
