import * as fs from "fs";
import * as path from "path";
import { DiscountEngine } from "../src/services/discount_engine";
import { parseShipment } from "../src/domain/parsing";

function readLines(relPath: string): string[] {
  const fullPath = path.join(__dirname, "data", relPath);
  const content = fs.readFileSync(fullPath, "utf-8");
  return content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}


const expectedOutput = [
  "2015-02-01 S MR 1.50 0.50",
  "2015-02-02 S MR 1.50 0.50",
  "2015-02-03 L LP 6.90 -",
  "2015-02-05 S LP 1.50 -",
  "2015-02-06 S MR 1.50 0.50",
  "2015-02-06 L LP 6.90 -",
  "2015-02-07 L MR 4.00 -",
  "2015-02-08 M MR 3.00 -",
  "2015-02-09 L LP 0.00 6.90",
  "2015-02-10 L LP 6.90 -",
  "2015-02-10 S MR 1.50 0.50",
  "2015-02-10 S MR 1.50 0.50",
  "2015-02-11 L LP 6.90 -",
  "2015-02-12 M MR 3.00 -",
  "2015-02-13 M LP 4.90 -",
  "2015-02-15 S MR 1.50 0.50",
  "2015-02-17 L LP 6.90 -",
  "2015-02-17 S MR 1.90 0.10",
  "2015-02-24 L LP 6.90 -",
  "2015-02-29 CUSPS Ignored",
  "2015-03-01 S MR 1.50 0.50",
];

describe("sample flow", () => {
  it("matches expected sample output", () => {
    const inputLines = readLines("input.txt");

    const engine = new DiscountEngine();
    const actual: string[] = [];

    for (const line of inputLines) {
      const shipment = parseShipment(line);
      if (!shipment) {
        actual.push(`${line} Ignored`);
      } else {
        actual.push(engine.processShipment(shipment));
      }
    }

    expect(actual).toEqual(expectedOutput);
  });
});
