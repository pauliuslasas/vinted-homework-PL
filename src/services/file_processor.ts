import * as fs from "fs";
import * as path from "path";
import { DiscountEngine } from "./discount_engine";
import { parseShipment } from "../domain/parsing";

export class FileProcessor {
  constructor(private engine: DiscountEngine = new DiscountEngine()) {}

  processFile(filePath: string): string[] {
    const file = path.resolve(process.cwd(), filePath);

    // --- file validation ---
    if (!fs.existsSync(file)) {
      throw new Error(`Input file not found: ${file}`);
    }

    const stat = fs.statSync(file);
    if (!stat.isFile()) {
      throw new Error(`Input path is not a file: ${file}`);
    }

    const raw = fs.readFileSync(file, "utf-8");

    if (raw.trim().length === 0) {
      return ["Input file is empty"];
    }
    // --- end file validation ---

    const lines = raw.split(/\r?\n/);
    const output: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const shipment = parseShipment(trimmed);
      output.push(
        shipment ? this.engine.processShipment(shipment)
                 : `${trimmed} Ignored`
      );
    }

    return output;
  }
}
