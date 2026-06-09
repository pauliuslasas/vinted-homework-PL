import { FileProcessor } from "./services/file_processor";

function main() {
  const inputFile = process.argv[2] || "input.txt";
  const processor = new FileProcessor();

  try {
    const outputLines = processor.processFile(inputFile);
    outputLines.forEach(line => console.log(line));
  } catch (err) {
    console.error("Error:", (err as Error).message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}