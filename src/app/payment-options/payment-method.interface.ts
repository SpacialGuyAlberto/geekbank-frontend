import {OrderDetails} from "../models/order-details.model";

export interface PaymentMethod {
  initializePayment(orderDetails: OrderDetails): void;
  confirmPayment?(confirmationData: any): void;
  cancelPayment?(): void;
}
