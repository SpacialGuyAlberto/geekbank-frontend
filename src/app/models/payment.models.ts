// src/app/models/payment.models.ts

export interface CreatePaymentResponse {
  orderId: string;
  approvalUrl: string;
}

export interface CapturePaymentResponse {
  status: string;
  captureId: string;

}

export interface CreatePayoutRequest {
  email: string;
  amount: string;
  currency: string;
  note: string;
  recipientName: string;
}

export interface CreatePayoutResponse {
  batchId: string;
  batchStatus: string;
}
