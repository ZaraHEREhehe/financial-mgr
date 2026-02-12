import { ExchangeRates } from "./types";

export class CurrencyEngine {
  private exchangeRates: ExchangeRates;
  private precision: number = 6; // Decimal places

  constructor() {
    // Initialize with base rates (can be updated daily)
    this.exchangeRates = {
      "USD/EUR": 0.92,
      "USD/GBP": 0.79,
      "USD/PKR": 278.5,
      "EUR/GBP": 0.86,
      "EUR/PKR": 302.7,
      "GBP/PKR": 351.2,
      timestamp: new Date(),
    };
  }

  /**
   * Update exchange rates (simulating daily market changes)
   * @param volatility - Random shock to rates (e.g., 0.02 = ±2%)
   */
  updateRates(volatility: number): void {
    const pairs = Object.keys(this.exchangeRates).filter((k) => k !== "timestamp");

    pairs.forEach((pair) => {
      const shock = (Math.random() - 0.5) * volatility; // Random between -vol/2 and +vol/2
      const currentRate = this.exchangeRates[pair] as number;
      this.exchangeRates[pair] = Number(
        (currentRate * (1 + shock)).toFixed(this.precision)
      );
    });

    this.exchangeRates.timestamp = new Date();
  }

  /**
   * Convert amount from one currency to another
   * @param amount - Amount to convert
   * @param fromCurrency - Source currency (e.g., "USD")
   * @param toCurrency - Target currency (e.g., "EUR")
   * @returns Converted amount with precision maintained
   */
  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) {
      return this.truncateToPrecision(amount);
    }

    const pair = `${fromCurrency}/${toCurrency}`;
    const reversePair = `${toCurrency}/${fromCurrency}`;

    let rate: number;

    if (pair in this.exchangeRates && pair !== "timestamp") {
      rate = this.exchangeRates[pair] as number;
    } else if (reversePair in this.exchangeRates && reversePair !== "timestamp") {
      rate = 1 / (this.exchangeRates[reversePair] as number);
    } else {
      // Attempt indirect conversion (e.g., USD -> GBP via EUR)
      const indirectRate = this.getIndirectRate(fromCurrency, toCurrency);
      if (!indirectRate) {
        throw new Error(`No exchange rate found for ${pair}`);
      }
      rate = indirectRate;
    }

    const converted = amount * rate;
    return this.truncateToPrecision(converted);
  }

  /**
   * Find indirect conversion path
   */
  private getIndirectRate(from: string, to: string): number | null {
    // Try common intermediaries
    const intermediaries = ["USD", "EUR"];

    for (const inter of intermediaries) {
      if (inter === from || inter === to) continue;

      const pair1 = `${from}/${inter}`;
      const pair2 = `${inter}/${to}`;

      if (pair1 in this.exchangeRates && pair2 in this.exchangeRates) {
        return (this.exchangeRates[pair1] as number) * (this.exchangeRates[pair2] as number);
      }
    }

    return null;
  }

  /**
   * Maintain floating-point precision
   */
  private truncateToPrecision(value: number): number {
    return Number(value.toFixed(this.precision));
  }

  /**
   * Get current rate for a pair
   */
  getRate(fromCurrency: string, toCurrency: string): number {
    const pair = `${fromCurrency}/${toCurrency}`;
    const reversePair = `${toCurrency}/${fromCurrency}`;

    if (pair in this.exchangeRates && pair !== "timestamp") {
      return this.exchangeRates[pair] as number;
    } else if (reversePair in this.exchangeRates && reversePair !== "timestamp") {
      return 1 / (this.exchangeRates[reversePair] as number);
    }

    throw new Error(`Rate not found for ${pair}`);
  }

  /**
   * Get all rates snapshot (for deterministic testing)
   */
  getRatesSnapshot(): ExchangeRates {
    return { ...this.exchangeRates };
  }

  /**
   * Set rates manually (for seeded simulations)
   */
  setRates(rates: ExchangeRates): void {
    this.exchangeRates = { ...rates };
  }
}