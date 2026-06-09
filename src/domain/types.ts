export type Provider = "LP" | "MR";
export type Size = "S" | "M" | "L";

export interface Shipment {
  date: string;     // "YYYY-MM-DD"
  monthKey: string; // "YYYY-MM"
  size: Size;
  provider: Provider;
}

export interface MonthlyStats {
  totalDiscount: number;    // cents
  lpLCount: number;         // number of L/LP in this month
  thirdLFreeUsed: boolean;  // whether the monthly free L/LP has been used
}

export function isProvider(code: string): code is Provider {
  return code === "LP" || code === "MR";
}

export function isSize(code: string): code is Size {
  return code === "S" || code === "M" || code === "L";
}
