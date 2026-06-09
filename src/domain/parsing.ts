import { Shipment, isProvider, isSize } from "./types";

export function parseShipment(line: string): Shipment | null {
  const parts = line.trim().split(/\s+/);
  if (parts.length !== 3) return null;

  const [date, sizeCode, providerCode] = parts;
  if (!isValidDate(date)) return null;
  if (!isSize(sizeCode) || !isProvider(providerCode)) return null;

  const monthKey = date.substring(0, 7); // "YYYY-MM"

  return { date, size: sizeCode, provider: providerCode, monthKey };
}

function isValidDate(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}
