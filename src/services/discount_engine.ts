import { PRICE_TABLE, MONTHLY_DISCOUNT_CAP } from "../config/prices";
import { Shipment, MonthlyStats } from "../domain/types";
import { formatMoney } from "../utils/money";
import { DiscountRule, MonthStatsDelta, RuleContext } from "../rules/discount_rule";
import { ThirdFreeRule } from "../rules/third_free_rule";
import { LowestPriceRule } from "../rules/lowest_price_rule";

export class DiscountEngine {
  private readonly statsByMonth = new Map<string, MonthlyStats>();

  // Rules are applied in this order. This matters when a rule returns
  // monthStatsDelta that affects later rules in the same transaction.
  constructor(
    private readonly rules: DiscountRule[] = [
      new ThirdFreeRule(),
      new LowestPriceRule(),
    ]
  ) {}

  processShipment(shipment: Shipment): string {
    const monthStats = this.getMonthlyStats(shipment.monthKey);
    const workingMonthStats: MonthlyStats = { ...monthStats };
    const basePrice = PRICE_TABLE[shipment.provider][shipment.size];

    let proposedDiscount = 0;
    for (const rule of this.rules) {
      const ctx: RuleContext = {
        shipment,
        basePrice,
        monthStats: workingMonthStats,
      };
      const result = rule.apply(ctx);
      proposedDiscount += result.discount;
      this.applyMonthStatsDelta(workingMonthStats, result.monthStatsDelta);
    }

    // Never discount more than the base price
    if (proposedDiscount > basePrice) proposedDiscount = basePrice;

    // Apply monthly cap centrally
    const remainingCap = MONTHLY_DISCOUNT_CAP - monthStats.totalDiscount;
    let actualDiscount = proposedDiscount;

    if (remainingCap <= 0) {
      actualDiscount = 0;
    } else if (actualDiscount > remainingCap) {
      actualDiscount = remainingCap;
    }

    const finalPrice = basePrice - actualDiscount;
    monthStats.lpLCount = workingMonthStats.lpLCount;
    monthStats.thirdLFreeUsed = workingMonthStats.thirdLFreeUsed;
    monthStats.totalDiscount += actualDiscount;

    const priceStr = formatMoney(finalPrice);
    const discountStr =
      actualDiscount > 0 ? formatMoney(actualDiscount) : "-";

    return `${shipment.date} ${shipment.size} ${shipment.provider} ${priceStr} ${discountStr}`;
  }

  private getMonthlyStats(monthKey: string): MonthlyStats {
    let stats = this.statsByMonth.get(monthKey);
    if (!stats) {
      stats = { totalDiscount: 0, lpLCount: 0, thirdLFreeUsed: false };
      this.statsByMonth.set(monthKey, stats);
    }
    return stats;
  }

  private applyMonthStatsDelta(
    monthStats: MonthlyStats,
    delta?: MonthStatsDelta
  ): void {
    if (!delta) return;

    if (delta.lpLCountIncrement) {
      monthStats.lpLCount += delta.lpLCountIncrement;
    }

    if (delta.thirdLFreeUsed !== undefined) {
      monthStats.thirdLFreeUsed = delta.thirdLFreeUsed;
    }
  }
}
