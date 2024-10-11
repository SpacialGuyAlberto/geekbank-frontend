// import { Component, Inject } from '@angular/core';
// import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
// import { TigoPaymentComponent } from '../tigo-payment/tigo-payment.component';
//
// @Component({
//   selector: 'app-payment-modal',
//   standalone: true,
//   imports: [
//     MatDialogContent,
//     TigoPaymentComponent,
//     MatDialogActions
//   ],
//   templateUrl: './payment-modal.component.html',
//   styleUrl: './payment-modal.component.css'
// })
// export class PaymentModalComponent {
//   constructor(
//     public dialogRef: MatDialogRef<PaymentModalComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: { cartItems: any[], totalPrice: number }
//   ) { }
//
//   onClose(): void {
//     this.dialogRef.close();
//   }
// }
