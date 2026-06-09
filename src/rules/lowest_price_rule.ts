import { DiscountRule, RuleContext, RuleResult } from "./discount_rule";
import { PRICE_TABLE } from "../config/prices";

export class LowestPriceRule implements DiscountRule {
  private readonly lowestSPrice: number;

  constructor() {
    const sPrices = Object.values(PRICE_TABLE).map(p => p.S);
    this.lowestSPrice = Math.min(...sPrices);
  }

  apply(ctx: RuleContext): RuleResult {
    if (ctx.shipment.size !== "S") return { discount: 0 };

    const base = ctx.basePrice;
    if (base <= this.lowestSPrice) return { discount: 0 };

    return { discount: base - this.lowestSPrice };
  }
}
