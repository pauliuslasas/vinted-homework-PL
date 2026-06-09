## Vinted Shipping Discount Calculator

This project calculates the shipment discount rules described in the Vinted homework assignment.
It is written in TypeScript using Node.js, no external runtime libraries are used — only Node’s standard library and Jest for testing. 

# Features
----------------------------
* Reads shipments from `input.txt` by default in the repository root, or from a provided file path.
* Applies the following rules:
    1. Lowest S Price Rule - all S packages always cost the lowest available S price.
    2. Third L Shipment Free via LP - once per calendar month, the 3rd L shipment via LP becomes free.
    3. Monthly Discount Cap - total monthly discounts cannot exceed 10 EUR, and partial discounts are applied if the cap is nearly reached.
* Prints results to STDOUT.
* Invalid lines are echoed with `Ignored`.
* Input parsing validates date format and rejects impossible calendar dates.
* Fully tested with parsing, rule, engine, file processing, and end-to-end coverage.

# Code structure
----------------------------
```
src/
├─ index.ts                  # Entry point 
├─ config/
│   └─ prices.ts             # Provider prices, discount cap
├─ domain/
│   ├─ types.ts              # Main types (Shipment, Provider, Size)
│   └─ parsing.ts            # Input line parsing
├─ rules/
│   ├─ discount_rule.ts       # Rule interface + RuleContext
│   ├─ lowest_price_rule.ts
│   └─ third_free_rule.ts
├─ services/
│   ├─ file_processor.ts      # Reads the input file
│   └─ discount_engine.ts     # Applies rules + monthly cap
└─ utils/
    └─ money.ts              # Formatting helpers
```

This structure was chosen for several reasons:
* Separation of rules and engine
* Easy to extend, add new rule, add it to the engine and it works
* Easy to test independently

# How It Works
----------------------------
1. `src/index.ts` reads the input file path from CLI arguments.
2. `FileProcessor` validates the file, reads non-empty lines, and parses each line into a `Shipment`.
3. `DiscountEngine` calculates the base price, runs the configured rules, applies the monthly cap, and formats the final output line.

Rules are injected into `DiscountEngine` through its constructor. The default application setup uses:

```ts
new DiscountEngine([
  new ThirdFreeRule(),
  new LowestPriceRule(),
]);
```

Rules do not mutate shared monthly state directly. Each rule returns:
* a proposed discount
* an optional `monthStatsDelta`

The engine applies those deltas centrally, which makes rule interaction easier to reason about and test.

# Running the code
----------------------------
The project is run on NodeJS, so having Node is a requirement

1. Run `npm install`
2. Run `npm start` it will read the `input.txt` by default from root, alternatively it is posible to provide a path using `npm start -- path/to/myfile.txt`

Done, the project should out put somehting like this:
```
2015-02-01 S MR 1.50 0.50
2015-02-02 S MR 1.50 0.50
```

# Running tests
----------------------------
For testing `jest` library was used, to run **all tests** just type `npm test`.
To run individual tests the easiest way is to install a `Jest runner` extension and then just pren **Run** on top of the test which you want to run.

There are 5 test files:
1. `parsing.test.ts` validates input parsing
2. `rules.test.ts` tests individual rules
3. `discountEngine.test.ts` tests combined rule behavior and the monthly cap
4. `fileProcessor.test.ts` tests input file validation and reading
5. `fullFlow.test.ts` is an end-to-end test using the assignment sample input

# Adding new rules
----------------------------
To add a new rule:
1. Create a new file in `src/rules/`
2. Implement `DiscountRule`
3. Return both the rule discount and any needed `monthStatsDelta`
4. Inject the rule into `DiscountEngine`, for example:

```ts
const engine = new DiscountEngine([
  new ThirdFreeRule(),
  new LowestPriceRule(),
  new MyNewRule(),
]);
```

5. Add unit tests for the rule and, if needed, engine-level tests for rule interaction

## Design Notes

Even though the implementation is written in TypeScript, I tried to follow the
object-oriented and readability philosophy described in the Ruby Style
Guide and referenced some points:

- One class per file.
- Small focused classes with single responsibilities.
- Explicit naming.
- Rules implemented as isolated objects.
- Separation between file processing, parsing, and business logic.