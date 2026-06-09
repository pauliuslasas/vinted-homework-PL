
import { DiscountEngine } from "../src/services/discount_engine";
import { Shipment } from "../src/domain/types";

describe("DiscountEngine", () => {
  it("gives correct discount for simple S shipment MR", () => {
    const engine = new DiscountEngine();
    const shipment: Shipment = {
      date: "2015-02-01",
      monthKey: "2015-02",
      provider: "MR",
      size: "S",
    };

    const line = engine.processShipment(shipment);
    expect(line).toBe("2015-02-01 S MR 1.50 0.50");
  });

  it("gives 3rd L/LP free", () => {
    const engine = new DiscountEngine();

    const shipments: Shipment[] = [
      { date: "2015-02-03", monthKey: "2015-02", size: "L", provider: "LP" },
      { date: "2015-02-06", monthKey: "2015-02", size: "L", provider: "LP" },
      { date: "2015-02-09", monthKey: "2015-02", size: "L", provider: "LP" },
    ];

    const outputs = shipments.map((s) => engine.processShipment(s));

    expect(outputs[0]).toBe("2015-02-03 L LP 6.90 -"); // first 
    expect(outputs[1]).toBe("2015-02-06 L LP 6.90 -"); // second
    expect(outputs[2]).toBe("2015-02-09 L LP 0.00 6.90"); // third is free
  });

  it("stops applying discounts after monthly cap is reached", () => {
    const engine = new DiscountEngine();
    const outputs = [];

    for (let i = 1; i <= 30; i++) {
      outputs.push(
        engine.processShipment({
          date: `2015-02-${String(i).padStart(2, "0")}`,
          monthKey: "2015-02",
          size: "S",
          provider: "MR",
        })
      );
    }
    
    expect(outputs[19]).toBe("2015-02-20 S MR 1.50 0.50");
    expect(outputs[20]).toBe("2015-02-21 S MR 2.00 -");

  });
});
