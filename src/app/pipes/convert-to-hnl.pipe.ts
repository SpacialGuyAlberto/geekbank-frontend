import {Pipe} from "@angular/core";
import {PricingService} from "../pricing/pricing.service";

@Pipe({name: 'convertToHnl', standalone: true, pure: true})
export class ConvertToHnlPipe {
  constructor(private pricing: PricingService) {}

  transform(priceEur: number, rate: number): number {
    return this.pricing.calculateConvertedPrice(priceEur, rate);
  }
}
