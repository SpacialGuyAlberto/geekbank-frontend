import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgForOf, NgIf} from "@angular/common";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faCcMastercard, faCcVisa, faCcAmex, faCcPaypal} from "@fortawesome/free-brands-svg-icons";

interface PaymentMethod {
  type: string;
  provider?: string; // Para Visa, MasterCard, etc.
  lastFourDigits?: string; // Para Tarjetas
  expiryDate?: string; // Para Tarjetas
  cardNumber?: string; // Para Tarjetas
  email?: string; // Para PayPal, Google Pay
  walletAddress?: string; // Para Monederos Virtuales y Blockchain
  cryptoCurrency?: string; // Para Monederos Virtuales
  blockchainNetwork?: string; // Para Blockchain
  country?: string; // Opcional para todos los tipos
}
@Component({
    selector: 'app-payment-methods',
    templateUrl: './payment-methods.component.html',
    imports: [FormsModule, FontAwesomeModule, NgIf, NgForOf],
    styleUrls: ['./payment-methods.component.css']
})
export class PaymentMethodsComponent implements OnInit {
  faVisa = faCcVisa;
  faMasterCard = faCcMastercard;
  // faPaypal = faCCPaypal;
  // faGooglePay = faGooglePay;
  // faWallet = faWallet;
  // faBitcoin = faBitcoin;
  // faEthereum = faEthereum;

  paymentMethods: PaymentMethod[] = [
    {
      type: 'Tarjeta',
      provider: 'Visa',
      lastFourDigits: '4242',
      expiryDate: '12/24',
      country: 'Estados Unidos',
    },
    {
      type: 'PayPal',
      email: 'user@paypal.com',
      country: 'España',
    },
    {
      type: 'Wallet Virtual',
      walletAddress: '0x123abc456def...',
      cryptoCurrency: 'Ethereum',
    },
    {
      type: 'Blockchain',
      blockchainNetwork: 'Bitcoin',
      walletAddress: 'bc1qxyz...',
    }
  ];

  // Método de pago nuevo inicializado vacío
  newPaymentMethod: PaymentMethod = {
    type: '',
    cardNumber: '',
    lastFourDigits: '',
    expiryDate: '',
    email: '',
    walletAddress: '',
    cryptoCurrency: '',
    blockchainNetwork: ''
  };

  constructor() {}

  ngOnInit(): void {
    this.loadPaymentMethods();
  }

  loadPaymentMethods(): void {

  }

  addPaymentMethod(): void {
    // Manejo del nuevo método de pago basado en el tipo
    if (this.newPaymentMethod.type === 'Tarjeta') {
      this.newPaymentMethod.lastFourDigits = this.newPaymentMethod.cardNumber?.slice(-4);
    }

    // Agregar el nuevo método de pago al arreglo
    this.paymentMethods.push({ ...this.newPaymentMethod });

    // Reiniciar el formulario
    this.paymentMethods = [
      {
        type: 'Tarjeta',
        provider: 'Visa',
        lastFourDigits: '4242',
        expiryDate: '12/24',
        country: 'Estados Unidos',
      },
      {
        type: 'PayPal',
        email: 'user@paypal.com',
        country: 'España',
      },
      {
        type: 'Wallet Virtual',
        walletAddress: '0x123abc456def...',
        cryptoCurrency: 'Ethereum',
      },
      {
        type: 'Google Pay',
        email: 'user@google.com',
        country: 'México',
      },
      {
        type: 'Blockchain',
        blockchainNetwork: 'Bitcoin',
        walletAddress: 'bc1qxyz...',
      }
    ];



  }

  editPaymentMethod(paymentMethod: PaymentMethod): void {
  }

  removePaymentMethod(paymentMethod: PaymentMethod): void {
    // Filtrar los métodos para eliminar el seleccionado
    this.paymentMethods = this.paymentMethods.filter(p => p !== paymentMethod);

  }
}
