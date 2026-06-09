import { DiscountRule, RuleContext, RuleResult } from "./discount_rule";

export class ThirdFreeRule implements DiscountRule {
  apply(ctx: RuleContext): RuleResult {
    const { shipment, basePrice, monthStats } = ctx;

    if (shipment.provider !== "LP" || shipment.size !== "L") {
      return { discount: 0 };
    }

    const nextLpLCount = monthStats.lpLCount + 1;
    const monthStatsDelta = { lpLCountIncrement: 1 };

    if (!monthStats.thirdLFreeUsed && nextLpLCount === 3) {
      return {
        discount: basePrice,
        monthStatsDelta: { ...monthStatsDelta, thirdLFreeUsed: true },
      };
    }

    return { discount: 0, monthStatsDelta };
  }
}
