export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: string;
  enabled: boolean;
  phoneNumber: number;
  account: Account;
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
