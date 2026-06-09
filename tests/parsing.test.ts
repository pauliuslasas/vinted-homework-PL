import { parseShipment } from "../src/domain/parsing";

describe("parseShipment", () => {
  it("parses a valid line", () => {
    const line = "2015-02-01 S MR";
    const shipment = parseShipment(line);

    expect(shipment).not.toBeNull();
    expect(shipment).toEqual({
      date: "2015-02-01",
      size: "S",
      provider: "MR",
      monthKey: "2015-02",
    });
  });

  it("returns null for wrong number of fields, missing provider", () => {
    const line = "2015-02-01 S"; 
    expect(parseShipment(line)).toBeNull();
  });

  it("returns null for invalid size", () => {
    const line = "2015-02-01 X MR";
    expect(parseShipment(line)).toBeNull();
  });

  it("returns null for invalid provider", () => {
    const line = "2015-02-01 S XX";
    expect(parseShipment(line)).toBeNull();
  });

  it("returns null for invalid date format", () => {
    const line = "2015/02/01 S MR";
    expect(parseShipment(line)).toBeNull();
  });

  it("returns null for impossible calendar date", () => {
    const line = "2015-02-30 S MR";
    expect(parseShipment(line)).toBeNull();
  });
});
