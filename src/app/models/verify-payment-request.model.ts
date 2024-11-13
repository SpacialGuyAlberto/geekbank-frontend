// src/app/payment/models/verify-payment-request.model.ts

import {OrderRequest} from "./order-request.model";

export interface VerifyPaymentRequest {
  refNumber: string;
  phoneNumber: string;
  orderRequest: OrderRequest;
}
