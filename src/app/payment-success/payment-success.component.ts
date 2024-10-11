// import { Component, OnInit } from '@angular/core';
// import {ActivatedRoute, Router} from '@angular/router';
// import { PaymentService } from '../services/payment.service';
// import {ToastrService} from "ngx-toastr";
// import {CapturePaymentResponse} from "../models/payment.models";
//
// @Component({
//   selector: 'app-payment-success',
//   standalone: true,
//   imports: [],
//   templateUrl: './payment-success.component.html',
//   styleUrl: './payment-success.component.css'
// })
// export class PaymentSuccessComponent implements OnInit {
//
//   constructor(
//     private route: ActivatedRoute,
//     private paymentService: PaymentService,
//     private router: Router,
//     private toastr: ToastrService // Opcional
//   ) { }
//
//   ngOnInit(): void {
//     this.route.queryParams.subscribe(params => {
//       const token = params['token'];
//       if (token) {
//         // Asumiendo que el token es el orderId
//         this.paymentService.capturePayment(token)
//           .subscribe({
//             next: (response: CapturePaymentResponse) => {
//               console.log('Pago capturado exitosamente:', response);
//               this.toastr.success('Pago realizado con éxito.', 'Éxito'); // Opcional
//               this.router.navigate(['/']); // Redirigir a la página principal u otra página
//             },
//             error: (error) => {
//               console.error('Error al capturar el pago:', error);
//               this.toastr.error('Ocurrió un error al capturar el pago.', 'Error'); // Opcional
//               this.router.navigate(['/']);
//             }
//           });
//       }
//     });
//   }
//
// }
