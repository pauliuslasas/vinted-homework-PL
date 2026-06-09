import { Provider, Size } from "../domain/types";

// In production environment this  could be injected into the DiscountEngine
// But since we have clear fixed sums in the spec, I treated them as configuration constants
export const PRICE_TABLE: Record<Provider, Record<Size, number>> = {
  LP: { S: 150, M: 490, L: 690 },
  MR: { S: 200, M: 300, L: 400 },
};

// 10eur in cents, easy to adjust in a single place
export const MONTHLY_DISCOUNT_CAP = 1000; 
