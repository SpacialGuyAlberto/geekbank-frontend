import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  loadScript,
  PayPalNamespace,
  CardFieldsOnApproveData,
  PayPalCardFieldsComponentOptions,
} from '@paypal/paypal-js';
import { firstValueFrom, Subscription } from 'rxjs';
import { PayPalService } from '../payment-options/pay-pal.service';
import { WebSocketService } from '../services/web-socket.service';
import { OrderService } from '../services/order.service';
import { TransactionsService } from '../transactions/transactions.service';
import { OrderRequest } from '../models/order-request.model';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-paypal-button',
    template: `
    <div id="paypal-button-container"></div>

    <!-- Card Fields UI (solo cuando paymentSource === 'card') -->
    <div *ngIf="paymentSource==='card' && cardEligible" class="card-field-wrapper">
      <label>Nombre</label>
      <div id="card-name-field-container"  class="hosted-field"></div>

      <label>Número</label>
      <div id="card-number-field-container" class="hosted-field"></div>

      <label>Expira</label>
      <div id="card-expiry-field-container" class="hosted-field"></div>

      <label>CVV</label>
      <div id="card-cvv-field-container"   class="hosted-field"></div>

      <button id="card-field-submit-button">Pagar</button>
    </div>
  `,
    imports: [NgIf]
})
export class PayPalButtonComponent implements OnInit, OnDestroy {
  /* ----------------- Inputs ----------------- */
  @Input() amount: string | null = null;
  @Input() orderDetails?: OrderRequest;
  @Input() paymentSource:
    | 'paypal' | 'venmo' | 'applepay' | 'itau' | 'credit'
    | 'paylater' | 'card' | 'ideal' | 'sepa' | 'bancontact' | 'giropay' = 'paypal';
  /** callback propio para tu lógica de negocio */
  @Input() onSubmitOrder?: () => Promise<OrderRequest>;

  /* ---------------- Outputs ----------------- */
  @Output() paymentSuccess       = new EventEmitter<string>();
  @Output() paymentFailure       = new EventEmitter<string>();
  @Output() transactionCancelled = new EventEmitter<void>();

  /* -------------- Estado interno ------------ */
  cardEligible = false;          // elegibilidad de Card Fields
  // @ts-ignore
  private cardField?: ReturnType<PayPalNamespace['CardFields']>;
  private currentOrderId = '';
  private wsSub?: Subscription;
  showSpinner = false;

  constructor(
    private payPal: PayPalService,
    private ws: WebSocketService,
    private orderSrv: OrderService,
    private trxSrv: TransactionsService
  ) {
    this.ws.connect();
  }

  /* ================ lifecycle =============== */
  async ngOnInit() {
    const paypal: PayPalNamespace | null = await loadScript({
      clientId: 'AdSFKstNcV1wB1UZLGjxgdWoPAoRRxab0GueeSo34FBSmSjbchZErM7WPxBrE5u6CxRUNwtnOaq4eS1W',
      currency: 'EUR',
      components: 'buttons,fields',   // "fields" es Card Fields
      enableFunding: 'card',
      intent: 'capture',
    });

    if (!paypal) {
      this.paymentFailure.emit('SDK PayPal no cargó');
      return;
    }

    /* -------- Card Fields elegibilidad y render -------- */
    if (this.paymentSource === 'card' && paypal.CardFields) {
      const options: PayPalCardFieldsComponentOptions = {
        createOrder: () => Promise.resolve(this.currentOrderId),
        onApprove: (data: CardFieldsOnApproveData): void => {
          // mantenemos la firma void y ejecutamos async aparte
          (async () => {
            const cap = await firstValueFrom(this.payPal.captureOrder(data.orderID));
            await this.handleCaptureResponse(cap);
          })().catch(err => {
            console.error('CardFields onApprove error', err);
            this.paymentFailure.emit('Error en Card Fields');
          });
        },
        onError: (err: Record<string, unknown>): void => {
          console.error('CardFields error', err);
          this.paymentFailure.emit('Error en Card Fields');
        },
        style: {
          input: { 'font-size': '16px', 'font-family': 'monospace', color: '#ccc' },
          '.invalid': { color: 'purple' },
        },
      };

      this.cardField = paypal.CardFields(options);

      if (this.cardField.isEligible()) {
        this.cardField.NameField().render('#card-name-field-container');
        this.cardField.NumberField().render('#card-number-field-container');
        this.cardField.ExpiryField().render('#card-expiry-field-container');
        this.cardField.CVVField().render('#card-cvv-field-container');

        document
          .getElementById('card-field-submit-button')
          ?.addEventListener('click', () => {
            this.cardField!.submit().catch((err: unknown) => console.error('Card submit', err));
          });
        this.cardEligible = true;
      }
    }

    await this.renderButtons(paypal);

    /* ------------- WebSocket (sin cambios) ------------- */
    this.wsSub = this.ws.subscribeToTransactionStatus().subscribe(({ status }) => {
      this.showSpinner = status !== 'COMPLETED' && status !== 'CANCELLED';
      if (status === 'CANCELLED') this.transactionCancelled.emit();
    });
  }

  ngOnDestroy() {
    this.wsSub?.unsubscribe();
    this.ws.disconnect();
    this.cardField?.teardown();
  }

  /* ============== PayPal Buttons ============== */
  private async renderButtons(paypal: PayPalNamespace) {
    if (!paypal.Buttons) return;

    await paypal
      .Buttons({
        fundingSource: this.paymentSource,

        /* ---- createOrder: backend ---- */
        createOrder: async () => {
          const { id } = await firstValueFrom(this.payPal.createOrder(this.amount));
          if (!id) throw new Error('createOrder sin id');
          this.currentOrderId = id;
          return id;
        },

        /* ---- onApprove: captura ---- */
        onApprove: async (_d, actions) => {
          const cap = await firstValueFrom(this.payPal.captureOrder(this.currentOrderId));
          await this.handleCaptureResponse(cap, actions);
        },

        onError: err => {
          console.error(err);
          this.paymentFailure.emit('PayPal error');
        },
      })
      .render('#paypal-button-container');
  }

  /* -------- Manejar respuesta de captura -------- */
  private async handleCaptureResponse(cap: any, actions?: any) {
    if (cap.status === 422 && cap.body?.details?.[0]?.issue === 'INSTRUMENT_DECLINED') {
      await actions?.restart?.();
      return;
    }
    if (cap.status !== 200 && cap.status !== 201) {
      this.paymentFailure.emit('Captura HTTP ' + cap.status);
      return;
    }
    const txId = cap.body?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? 'UNKNOWN';
    await this.finishSuccess(txId);
  }

  /* -------- Post‑pago común (sin cambios) -------- */
  private async finishSuccess(transactionId: string) {
    try {
      const internal = this.orderDetails ?? (await this.onSubmitOrder?.());
      if (internal) {
        // await this.orderSrv.placeOrderAndTransaction(internal);
      }
    } catch (e) {
      console.error('Error lógica interna', e);
    }
    this.paymentSuccess.emit(transactionId);
  }
}
