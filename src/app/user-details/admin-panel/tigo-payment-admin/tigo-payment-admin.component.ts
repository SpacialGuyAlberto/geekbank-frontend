import { Component, OnInit } from '@angular/core';
import { UnmatchedPayment, UnmatchedPaymentService } from '../../../services/unmatched-payment.service';
import { DomSanitizer } from '@angular/platform-browser';
import {CurrencyPipe, DatePipe, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

// Importamos MatSnackBar y su módulo
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tigo-payment-admin',
  templateUrl: './tigo-payment-admin.component.html',
  styleUrls: ['./tigo-payment-admin.component.css'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    NgForOf,
    MatSnackBarModule,
    NgOptimizedImage
  ]
})
export class TigoPaymentAdminComponent implements OnInit {

  payments: UnmatchedPayment[] = [];
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  selectedPayment: UnmatchedPayment = this.initializePayment();
  imageFile: File | null = null;

  // Campos de búsqueda
  searchPhoneNumber: string = '';
  searchReferenceNumber: string = '';

  constructor(
    private paymentService: UnmatchedPaymentService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar
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
      receivedAt: new Date().toISOString().slice(0, 16), // Formato para input datetime-local
      consumed: false,
      differenceRedeemed: false,
      verified: false,
      image: null
    };
  }

  // Método para mostrar notificaciones (SnackBar)
  showSuccessMessage(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000, // duración en ms
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  // Obtener todos los pagos
  fetchPayments(): void {
    this.isLoading = true;
    this.paymentService.getAllPayments().subscribe(
      (data: UnmatchedPayment[]) => {
        // Suponiendo que el backend retorna la propiedad 'imageBase64' (o similar):
        // Aseguramos que cada pago tenga su base64 (si aplica)
        this.payments = data.map((payment) => {
          return {
            ...payment
          };
        });
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  // Propiedad computada que devuelve la lista filtrada
  get filteredPayments(): UnmatchedPayment[] {
    return this.payments.filter((payment) => {
      const matchPhone = this.searchPhoneNumber
        ? payment.phoneNumber
          .toLowerCase()
          .includes(this.searchPhoneNumber.toLowerCase())
        : true;
      const matchReference = this.searchReferenceNumber
        ? payment.referenceNumber
          .toLowerCase()
          .includes(this.searchReferenceNumber.toLowerCase())
        : true;

      return matchPhone && matchReference;
    });
  }

  // Abrir el modal para crear un nuevo pago
  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedPayment = this.initializePayment();
    this.imageFile = null;
    this.isModalOpen = true;
  }

  // Abrir el modal para editar un pago existente
  openEditModal(payment: UnmatchedPayment): void {
    this.isEditMode = true;
    // Convertimos la fecha en formato compatible para el input datetime-local
    this.selectedPayment = {
      ...payment,
      receivedAt: this.formatDateForInput(payment.receivedAt)
    };
    this.imageFile = null;
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
    const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  }

  // Manejar el archivo seleccionado
  onFileSelected(event: any): void {
    this.imageFile = event.target.files[0];
  }

  // Crear o actualizar un pago (se usa el mismo endpoint en este ejemplo)
  onSubmit(): void {
    const formData = new FormData();
    formData.append('payment', new Blob([JSON.stringify(this.selectedPayment)], {
      type: 'application/json'
    }));

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    // Subida de pago (crear o actualizar).
    // Ajusta la lógica si tu backend difiere entre crear / editar.
    this.paymentService.uploadPayment(formData).subscribe(
      response => {
        // Notificamos al usuario
        if (this.isEditMode) {
          this.showSuccessMessage('Pago actualizado con éxito');
        } else {
          this.showSuccessMessage('Pago creado con éxito');
        }

        this.closeModal();
        this.fetchPayments();
      },
      error => console.error('Error', error)
    );
  }

  // Eliminar un pago
  deletePayment(id: number | undefined): void {
    if (id === undefined) return;
    if (confirm('¿Estás seguro de que deseas eliminar este pago?')) {
      this.paymentService.deletePayment(id).subscribe(
        () => {
          this.showSuccessMessage('Pago eliminado con éxito');
          this.fetchPayments();
        },
        (error) => {
          console.error('Error al eliminar el pago:', error);
        }
      );
    }
  }

  // Alternar el estado de Consumido
  toggleConsumed(payment: UnmatchedPayment): void {
    payment.consumed = !payment.consumed;
    this.paymentService.updatePayment(payment.id!, payment).subscribe(
      () => {
        this.showSuccessMessage('Pago (consumido) actualizado con éxito');
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
        this.showSuccessMessage('Pago (diferencia redimida) actualizado con éxito');
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
        this.showSuccessMessage('Pago (verificado) actualizado con éxito');
      },
      (error) => {
        payment.verified = !payment.verified; // Revertir en caso de error
      }
    );
  }
}
