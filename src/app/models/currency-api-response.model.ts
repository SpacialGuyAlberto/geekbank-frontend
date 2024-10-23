// src/app/models/currency-api-response.model.ts
export interface Meta {
  code: number;
  disclaimer: string;
}

export interface CurrencyConversionResponse {
  timestamp: number;
  date: string;
  from: string;
  to: string;
  amount: number;
  value: number;
}

export interface CurrencyApiResponse {
  meta: Meta;
  response: CurrencyConversionResponse;
}
