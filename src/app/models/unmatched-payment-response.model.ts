// src/app/models/unmatched-payment-response.model.ts

export interface SmsMessage {
  id: number;
  messageFrom: string;
  amountReceived: number;
  senderPhoneNumber: string;
  referenceNumber: string;
  date: string;
  time: string;
  newBalance: number;
  receivedAt: string;
}

export interface UnmatchedPayment {
  id: number;
  phoneNumber: string;
  amountReceived: number;
  referenceNumber: string;
  receivedAt: string;
  smsMessage: SmsMessage;
}

export interface UnmatchedPaymentResponseDto {
  unmatchedPayment: UnmatchedPayment;
  receivedAmount: number;
  expectedAmount: number;
  difference: number;
  message: string;
  options: string[];
}
