export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: string;
  enabled: boolean;
  phoneNumber: number;
  addresses?: Address[];
  paymentOptions?: PaymentOption[];
  receivePromotions?: boolean;
  receiveOrderUpdates?: boolean;
  account: Account;
}

export interface Address {
  id?: number;
  street: string;
  city: string;
  country: string;
  zipCode: string;
}

export interface PaymentOption {
  id?: number;
  type: string;
  lastFourDigits: string;
  provider: string;
}

export interface Account {
  id: number;
  accountNumber: string;
  balance: number;

  status: string;
  accountType: string;
  dailyLimit: number;
  verificationStatus: string;
  loyaltyPoints: number;
  createdDate: string;
  updatedDate: string;
}
