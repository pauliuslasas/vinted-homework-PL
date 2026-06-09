import { LowestPriceRule } from "../src/rules/lowest_price_rule";
import { ThirdFreeRule } from "../src/rules/third_free_rule";
import { RuleContext } from "../src/rules/discount_rule";
import { MonthlyStats, Shipment } from "../src/domain/types";
import { PRICE_TABLE } from "../src/config/prices";

function makeStats(): MonthlyStats {
  return { totalDiscount: 0, lpLCount: 0, thirdLFreeUsed: false };
}

describe("LowestSPriceRule", () => {
  it("applies discount for S shipments when provider is not cheapest", () => {
    const rule = new LowestPriceRule();

    const shipment: Shipment = {
      date: "2015-02-01",
      monthKey: "2015-02",
      provider: "MR", 
      size: "S",
    };

    const ctx: RuleContext = {
      shipment,
      basePrice: PRICE_TABLE.MR.S, 
      monthStats: makeStats(),
    };

    const result = rule.apply(ctx);
    expect(result.discount).toBe(50); 
  });

  it("does not apply discount for non-S shipments", () => {
    const rule = new LowestPriceRule();
    const shipment: Shipment = {
      date: "2015-02-01",
      monthKey: "2015-02",
      provider: "MR",
      size: "M",
    };

    const ctx: RuleContext = {
      shipment,
      basePrice: PRICE_TABLE.MR.M,
      monthStats: makeStats(),
    };

    const result = rule.apply(ctx);
    expect(result.discount).toBe(0);
  });
});

describe("ThirdFreeRule", () => {
  it("returns no discount and increments count before the 3rd L/LP shipment", () => {
    const rule = new ThirdFreeRule();

    const result = rule.apply({
      shipment: {
        date: "2015-02-01",
        monthKey: "2015-02",
        provider: "LP",
        size: "L",
      },
      basePrice: PRICE_TABLE.LP.L,
      monthStats: {
        totalDiscount: 0,
        lpLCount: 0,
        thirdLFreeUsed: false,
      },
    });

    expect(result).toEqual({
      discount: 0,
      monthStatsDelta: { lpLCountIncrement: 1 },
    });
  });

  it("makes the 3rd L/LP shipment free", () => {
    const rule = new ThirdFreeRule();

    const result = rule.apply({
      shipment: {
        date: "2015-02-03",
        monthKey: "2015-02",
        provider: "LP",
        size: "L",
      },
      basePrice: PRICE_TABLE.LP.L,
      monthStats: {
        totalDiscount: 0,
        lpLCount: 2,
        thirdLFreeUsed: false,
      },
    });

    expect(result).toEqual({
      discount: PRICE_TABLE.LP.L,
      monthStatsDelta: {
        lpLCountIncrement: 1,
        thirdLFreeUsed: true,
      },
    });
  });

  it("does not apply again after the free L/LP discount was used", () => {
    const rule = new ThirdFreeRule();

    const result = rule.apply({
      shipment: {
        date: "2015-02-10",
        monthKey: "2015-02",
        provider: "LP",
        size: "L",
      },
      basePrice: PRICE_TABLE.LP.L,
      monthStats: {
        totalDiscount: 0,
        lpLCount: 3,
        thirdLFreeUsed: true,
      },
    });

    expect(result).toEqual({
      discount: 0,
      monthStatsDelta: { lpLCountIncrement: 1 },
    });
  });

  it("does not apply to non-L/LP shipments", () => {
    const rule = new ThirdFreeRule();

    const result = rule.apply({
      shipment: {
        date: "2015-02-01",
        monthKey: "2015-02",
        provider: "MR",
        size: "L",
      },
      basePrice: PRICE_TABLE.MR.L,
      monthStats: makeStats(),
    });

    expect(result).toEqual({ discount: 0 });
  });
});
