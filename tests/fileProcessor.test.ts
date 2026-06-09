import { FileProcessor } from "../src/services/file_processor";
import * as fs from "fs";

jest.mock("fs");

describe("FileProcessor validation", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it("throws if file does not exist", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const processor = new FileProcessor();
    expect(() => processor.processFile("missing.txt")).toThrow(/not found/);
  });

  it("throws if path is not a file", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.statSync as jest.Mock).mockReturnValue({ isFile: () => false });

    const processor = new FileProcessor();
    expect(() => processor.processFile("folder")).toThrow(/not a file/);
  });

  it("returns processed lines for a valid file", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.statSync as jest.Mock).mockReturnValue({ isFile: () => true });
    (fs.readFileSync as jest.Mock).mockReturnValue("2015-02-01 S MR");

    const processor = new FileProcessor();
    expect(processor.processFile("input.txt")).toEqual([
      "2015-02-01 S MR 1.50 0.50",
    ]);
  });

  it("marks invalid lines as ignored", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.statSync as jest.Mock).mockReturnValue({ isFile: () => true });
    (fs.readFileSync as jest.Mock).mockReturnValue("2015-02-29 CUSPS");

    const processor = new FileProcessor();

    expect(processor.processFile("input.txt")).toEqual([
      "2015-02-29 CUSPS Ignored",
    ]);
  });
});
