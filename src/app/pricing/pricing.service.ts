import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PricingService {

  constructor() { }

  calculateConvertedPrice(basePrice: number, exchangeRate: number): number {

      let conversion = parseFloat((basePrice * exchangeRate).toFixed(2));
      let ceilRounding = Math.ceil(conversion)
      console.log("MATH CEIL ROUNDED NUMBER " + ceilRounding)
      let porcentage = ceilRounding * 0.10;
      return Math.ceil(ceilRounding + porcentage);

  }

  async convert(basePrice: number, exchangeRate: number): Promise<number> {
    const conversion   = +(basePrice * exchangeRate).toFixed(2);
    const ceilRounding = Math.ceil(conversion);
    const percentage   = ceilRounding * 0.10;
    return Math.ceil(ceilRounding + percentage);   // «async» lo envuelve en Promise
  }

  generatePersistentDiscount(cardName: string): number {
    let hash = 0;
    for (let i = 0; i < cardName.length; i++) {
      hash = (hash << 5) - hash + cardName.charCodeAt(i);
      hash = hash & hash;
    }

    const random = Math.abs(hash % 26) + 15;
    return random;
  }
}
