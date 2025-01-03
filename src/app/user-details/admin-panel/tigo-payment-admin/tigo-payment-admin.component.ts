// src/app/components/tigo-payment-admin/tigo-payment-admin.component.ts

import { Component, OnInit } from '@angular/core';
import {UnmatchedPayment, UnmatchedPaymentService} from "../../../services/unmatched-payment.service";
import { DomSanitizer } from '@angular/platform-browser';
import {CurrencyPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-tigo-payment-admin',
  templateUrl: './tigo-payment-admin.component.html',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    NgForOf
  ],
  styleUrls: ['./tigo-payment-admin.component.css']
})
export class TigoPaymentAdminComponent implements OnInit {

  payments: UnmatchedPayment[] = [];
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  selectedPayment: UnmatchedPayment = this.initializePayment();

  constructor(
    private paymentService: UnmatchedPaymentService,
    private sanitizer: DomSanitizer // Para manejar descargas seguras
  ) { }

  ngOnInit(): void {
    this.fetchPayments();
  }

  // Inicializar un pago vacío
  initializePayment(): {
    consumed: boolean;
    image: null;
    phoneNumber: string;
    referenceNumber: string;
    verified: boolean;
    receivedAt: string;
    amountReceived: number;
    differenceRedeemed: boolean
  } {
    return {
      phoneNumber: '',
      amountReceived: 0,
      referenceNumber: '',
      receivedAt: new Date().toISOString().slice(0,16), // Formato para input datetime-local
      consumed: false,
      differenceRedeemed: false,
      verified: false,
      image: null
    };
  }

  // Obtener todos los pagos
  fetchPayments(): void {
    this.isLoading = true;
    this.paymentService.getAllPayments().subscribe(
      (data) => {
        this.payments = data;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  // Abrir el modal para crear un nuevo pago
  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedPayment = this.initializePayment();
    this.isModalOpen = true;
  }

  // Abrir el modal para editar un pago existente
  openEditModal(payment: UnmatchedPayment): void {
    this.isEditMode = true;
    this.selectedPayment = { ...payment, receivedAt: this.formatDateForInput(payment.receivedAt) };
    this.isModalOpen = true;
  }

  // Cerrar el modal
  closeModal(): void {
    this.isModalOpen = false;
  }

  // Formatear la fecha para el input datetime-local
  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const tzOffset = date.getTimezoneOffset() * 60000; // Offset en milisegundos
    const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0,16);
    return localISOTime;
  }

  // Manejar la selección de archivo y convertir a Base64
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.convertFileToBase64(file).then((base64: string) => {
        this.selectedPayment.imageBase64 = base64;
      }).catch((error) => {

      });
    }
  }

  // Función para convertir un archivo a Base64
  convertFileToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject('No se pudo convertir el archivo');
        }
      };
      reader.onerror = (error) => reject(error);
    });
  }

  // Enviar el formulario para crear o editar un pago
  onSubmit(): void {
    if (this.isEditMode && this.selectedPayment.id) {
      this.paymentService.updatePayment(this.selectedPayment.id, this.selectedPayment).subscribe(
        (data) => {

          this.fetchPayments();
          this.closeModal();
        },
        (error) => {

        }
      );
    } else {
      this.paymentService.createPayment(this.selectedPayment).subscribe(
        (data) => {
          this.fetchPayments();
          this.closeModal();
        },
        (error) => {

        }
      );
    }
  }

  // Eliminar un pago
  deletePayment(id: number | undefined): void {
    if (id === undefined) return;
    if (confirm('¿Estás seguro de que deseas eliminar este pago?')) {
      this.paymentService.deletePayment(id).subscribe(
        () => {

          this.fetchPayments();
        },
        (error) => {
        }
      );
    }
  }

  // Alternar el estado de Consumido
  toggleConsumed(payment: UnmatchedPayment): void {
    payment.consumed = !payment.consumed;
    this.paymentService.updatePayment(payment.id!, payment).subscribe(
      () => {

      },
      (error) => {

        payment.consumed = !payment.consumed; // Revertir en caso de error
      }
    );
  }

  // Alternar el estado de Diferencia Redimida
  toggleDifferenceRedeemed(payment: UnmatchedPayment): void {
    payment.differenceRedeemed = !payment.differenceRedeemed;
    this.paymentService.updatePayment(payment.id!, payment).subscribe(
      () => {

      },
      (error) => {

        payment.differenceRedeemed = !payment.differenceRedeemed; // Revertir en caso de error
      }
    );
  }

  // Alternar el estado de Verificado
  toggleVerified(payment: UnmatchedPayment): void {
    payment.verified = !payment.verified;
    this.paymentService.updatePayment(payment.id!, payment).subscribe(
      () => {

      },
      (error) => {

        payment.verified = !payment.verified; // Revertir en caso de error
      }
    );
  }

}
