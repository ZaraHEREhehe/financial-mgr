import { WalletState, Liability } from "./types";

export class CreditEngine {
  private minScore: number = 300;
  private maxScore: number = 850;
  private baseScore: number = 650;

  /**
   * Calculate total debt in USD
   */
  calculateTotalDebt(liabilities: Liability[]): number {
    return liabilities.reduce((sum, liability) => sum + liability.principalBalance, 0);
  }

  /**
   * Calculate debt-to-income ratio
   */
  calculateDebtRatio(totalDebt: number, monthlyIncome: number): number {
    if (monthlyIncome === 0) return 1; // Max ratio
    return Math.min(totalDebt / (monthlyIncome * 12), 1); // Annual vs monthly
  }

  /**
   * Update credit score based on financial behavior
   * Formula: base + (punctuality * weight) - (debtRatio * weight)
   */
  updateCreditScore(state: WalletState, monthlyIncome: number): number {
    const totalDebt = this.calculateTotalDebt(state.liabilities);
    const debtRatio = this.calculateDebtRatio(totalDebt, monthlyIncome);

    // Punctuality: positive balance = good (paying on time)
    const punctualityBonus =
      state.balance > 0 ? (state.balance / 10000) * 50 : -100; // Max +50 or -100

    // Debt ratio penalty: higher debt = lower score
    const debtPenalty = debtRatio * 300; // Max -300

    // Balance improvement: larger balance = better (up to +100)
    const balanceBonus = Math.min(state.balance / 5000, 100);

    // Calculate new score
    let newScore =
      this.baseScore + punctualityBonus - debtPenalty + balanceBonus;

    // Cap between min and max
    newScore = Math.max(this.minScore, Math.min(newScore, this.maxScore));

    return Math.round(newScore);
  }

  /**
   * Accrue daily interest on all liabilities
   */
  accrueInterest(
    liabilities: Liability[]
  ): Liability[] {
    return liabilities.map((liability) => {
      const dailyRate = liability.interestRate / 365;
      const interestAmount = liability.principalBalance * dailyRate;

      return {
        ...liability,
        principalBalance: parseFloat(
          (liability.principalBalance + interestAmount).toFixed(2)
        ),
      };
    });
  }

  /**
   * Apply minimum payment (if any)
   */
  applyMinimumPayment(
    liabilities: Liability[],
    balance: number
  ): {
    updatedLiabilities: Liability[];
    totalPaid: number;
    newBalance: number;
  } {
    let totalPaid = 0;
    let newBalance = balance;

    const updatedLiabilities = liabilities.map((liability) => {
      if (!liability.minimumPayment || newBalance <= 0) {
        return liability;
      }

      const paymentAmount = Math.min(liability.minimumPayment, newBalance);
      newBalance -= paymentAmount;
      totalPaid += paymentAmount;

      return {
        ...liability,
        principalBalance: Math.max(
          0,
          parseFloat((liability.principalBalance - paymentAmount).toFixed(2))
        ),
      };
    });

    return {
      updatedLiabilities,
      totalPaid,
      newBalance,
    };
  }

  /**
   * Check if in default (missing payments)
   */
  isInDefault(state: WalletState): boolean {
    return state.balance < 0;
  }

  /**
   * Get credit tier based on score
   */
  getCreditTier(
    score: number
  ): "excellent" | "good" | "fair" | "poor" | "bad" {
    if (score >= 750) return "excellent";
    if (score >= 670) return "good";
    if (score >= 580) return "fair";
    if (score >= 450) return "poor";
    return "bad";
  }

  /**
   * Calculate credit score evolution (for output)
   * Returns array of scores over time
   */
  getEvolution(scores: number[]): number[] {
    return scores; // Return historical scores
  }
}