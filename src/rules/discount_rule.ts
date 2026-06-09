import { Shipment, MonthlyStats } from "../domain/types";

export interface RuleContext {
  shipment: Shipment;
  basePrice: number;   // cents
  monthStats: Readonly<MonthlyStats>;
}

export interface MonthStatsDelta {
  lpLCountIncrement?: number;
  thirdLFreeUsed?: boolean;
}

export interface RuleResult {
  discount: number;    // discount in cents
  monthStatsDelta?: MonthStatsDelta;
}

// Chosen an interface here because for now there is no common logic across rules.
// If there was any in the future this could be refactored into an abstract class.
export interface DiscountRule {
  apply(context: RuleContext): RuleResult;
}
