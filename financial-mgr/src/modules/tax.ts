import { Asset } from "./types";
import { CurrencyEngine } from "./currency";

export class TaxEngine {
  private currencyEngine: CurrencyEngine;
  private capitalGainsTaxRate: number = 0.15; // 15% on gains
  private incomeTaxRate: number = 0.22; // 22% on income (progressive, simplified)
  private longTermGainRate: number = 0.15; // 15% long-term (held > 1 year)
  private shortTermGainRate: number = 0.35; // 35% short-term

  constructor(currencyEngine: CurrencyEngine) {
    this.currencyEngine = currencyEngine;
  }

  /**
   * Calculate tax on income
   * @param income - Daily/monthly income
   * @returns Tax amount
   */
  calculateIncomeTax(income: number): number {
    // Simplified progressive tax (can be enhanced)
    let tax = 0;

    if (income > 10000) {
      tax += (income - 10000) * 0.24;
      tax += 10000 * 0.12;
    } else if (income > 5000) {
      tax += (income - 5000) * 0.12;
    } else {
      tax += income * 0.1;
    }

    return parseFloat(tax.toFixed(2));
  }

  /**
   * Calculate capital gains tax when asset is sold
   * Distinguishes between realized and unrealized gains
   * @param asset - Asset being sold
   * @param salePrice - Current market value
   * @param daysPossessed - Days held
   * @returns Tax owed on gain
   */
  calculateRealizedGainsTax(
    asset: Asset,
    salePrice: number,
    daysPossessed: number
  ): number {
    const baseValue = asset.baseValue || asset.amount;
    const gain = salePrice - baseValue;

    if (gain <= 0) return 0; // No tax on loss

    // Determine if long-term or short-term
    const isLongTerm = daysPossessed >= 365; // 1+ year
    const taxRate = isLongTerm ? this.longTermGainRate : this.shortTermGainRate;

    const tax = gain * taxRate;
    return parseFloat(tax.toFixed(2));
  }

  /**
   * NO tax on unrealized gains (while holding)
   * This is important for the spec compliance
   */
  unrealizedGainsTax(): number {
    return 0; // By design, we don't tax unrealized gains
  }

  /**
   * Calculate total tax liability in state
   * Tracks realized gains from sold assets
   */
  calculateTotalTaxLiability(
    realizedGains: Map<string, number>
  ): number {
    let totalTax = 0;

    realizedGains.forEach((gain) => {
      totalTax += gain * this.capitalGainsTaxRate;
    });

    return parseFloat(totalTax.toFixed(2));
  }

  /**
   * Apply tax to balance
   */
  applyTax(balance: number, taxAmount: number): number {
    return parseFloat((balance - taxAmount).toFixed(2));
  }

  /**
   * Multi-currency tax handling
   * Convert gains to base currency before applying tax
   */
  calculateTaxOnMultiCurrencyGain(
    gainAmount: number,
    gainCurrency: string,
    baseCurrency: string = "USD"
  ): number {
    const gainInBase = this.currencyEngine.convert(
      gainAmount,
      gainCurrency,
      baseCurrency
    );
    return this.capitalGainsTaxRate * gainInBase;
  }

  /**
   * Estimate annual tax (for planning)
   */
  estimateAnnualTax(
    monthlyIncome: number,
    expectedCapitalGains: number
  ): number {
    const incomeTax = this.calculateIncomeTax(monthlyIncome * 12);
    const gainsTax = expectedCapitalGains * this.capitalGainsTaxRate;

    return parseFloat((incomeTax + gainsTax).toFixed(2));
  }
}