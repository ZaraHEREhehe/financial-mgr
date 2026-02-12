import { WalletState } from "@/modules/types";

export interface VibeState {
  vibe: "happy" | "neutral" | "sad" | "stressed" | "thriving";
  emoji: string;
  color: string;
  petState: string; // "Puppy is happy", "Pet is anxious", etc.
  petEmoji: string;
  volatilityScore: number; // 0-100, higher = more volatile
  stabilityScore: number; // 0-100, higher = more stable
}

export class VibeEngine {
  /**
   * Calculate financial vibe from current state
   * Factors: balance, assets, credit score, volatility
   */
  calculateVibe(state: WalletState): VibeState {
    const volatilityScore = this.calculateVolatility(state);
    const stabilityScore = 100 - volatilityScore;
    const healthScore = this.calculateFinancialHealth(state);

    const vibe = this.mapHealthToVibe(healthScore, volatilityScore);
    const emoji = this.getVibeEmoji(vibe);
    const color = this.getVibeColor(vibe);
    const petState = this.generatePetState(vibe, healthScore);
    const petEmoji = this.getPetEmoji(vibe);

    return {
      vibe,
      emoji,
      color,
      petState,
      petEmoji,
      volatilityScore: parseFloat(volatilityScore.toFixed(2)),
      stabilityScore: parseFloat(stabilityScore.toFixed(2)),
    };
  }

  /**
   * Calculate volatility score from asset changes
   * Higher volatility = more risky/unstable
   */
  private calculateVolatility(state: WalletState): number {
    if (!state.history || state.history.length < 2) {
      return 50; // Default neutral
    }

    const balances = state.history.map((h) => h.balance);
    const mean = balances.reduce((a, b) => a + b) / balances.length;
    const variance =
      balances.reduce((sum, b) => sum + Math.pow(b - mean, 2), 0) /
      balances.length;
    const stdDev = Math.sqrt(variance);

    // Normalize to 0-100 scale
    const volatility = Math.min((stdDev / mean) * 100, 100);
    return Math.max(0, volatility);
  }

  /**
   * Calculate overall financial health (0-100)
   * Factors: balance adequacy, debt ratio, credit score
   */
  private calculateFinancialHealth(state: WalletState): number {
    // Balance score (0-30 points)
    const balanceScore =
      state.balance > 10000 ? 30 : (state.balance / 10000) * 30;

    // Credit score (0-30 points)
    const creditScore = (state.creditScore - 300) / 550; // Normalize 300-850 to 0-1
    const creditPoints = creditScore * 30;

    // Debt ratio (0-20 points)
    const totalDebt = state.liabilities.reduce(
      (sum, l) => sum + l.principalBalance,
      0
    );
    const debtRatio = totalDebt / (state.balance + totalDebt + 1);
    const debtPoints = Math.max(0, 20 * (1 - debtRatio));

    // Assets diversity (0-20 points)
    const assetDiversity = state.assets.length > 0 ? 20 : 0;

    const totalHealth =
      balanceScore + creditPoints + debtPoints + assetDiversity;
    return Math.min(100, Math.max(0, totalHealth));
  }

  /**
   * Map health score to vibe
   */
  private mapHealthToVibe(
    healthScore: number,
    volatilityScore: number
  ): "happy" | "neutral" | "sad" | "stressed" | "thriving" {
    // High health + low volatility = thriving
    if (healthScore > 75 && volatilityScore < 30) {
      return "thriving";
    }

    // High health + high volatility = happy but cautious
    if (healthScore > 60 && volatilityScore < 50) {
      return "happy";
    }

    // Medium health = neutral
    if (healthScore > 40) {
      return "neutral";
    }

    // Low health + high volatility = stressed
    if (healthScore < 40 && volatilityScore > 60) {
      return "stressed";
    }

    // Low health = sad
    return "sad";
  }

  /**
   * Get emoji for vibe
   */
  private getVibeEmoji(vibe: string): string {
    const vibeEmojis: { [key: string]: string } = {
      thriving: "🚀",
      happy: "😄",
      neutral: "😐",
      sad: "😟",
      stressed: "😰",
    };
    return vibeEmojis[vibe] || "😐";
  }

  /**
   * Get color for vibe (for UI)
   */
  private getVibeColor(vibe: string): string {
    const vibeColors: { [key: string]: string } = {
      thriving: "#10b981", // Green
      happy: "#84cc16", // Lime
      neutral: "#f59e0b", // Amber
      sad: "#ef4444", // Red
      stressed: "#dc2626", // Dark Red
    };
    return vibeColors[vibe] || "#6b7280";
  }

  /**
   * Generate cute pet state message
   */
  private generatePetState(vibe: string, healthScore: number): string {
    const responses: { [key: string]: string[] } = {
      thriving: [
        "Wallet puppy is running around happily! 🐕",
        "Pet is thriving and wants to celebrate! 🎉",
        "Your financial friend is doing great! ⭐",
      ],
      happy: [
        "Puppy is wagging its tail! 🐕‍🦺",
        "Pet feels optimistic about the future! 💪",
        "Financial friend is in good spirits! 😊",
      ],
      neutral: [
        "Pet is alert and watching carefully 👀",
        "Wallet buddy is staying steady 🧘",
        "Financial friend is cautious but okay 🤔",
      ],
      sad: [
        "Pet looks worried... 😔",
        "Wallet buddy needs some love 💔",
        "Financial friend is feeling down 📉",
      ],
      stressed: [
        "Pet is anxious and pacing around 😰",
        "Wallet buddy is in distress! 🆘",
        "Financial friend needs immediate help! ⚠️",
      ],
    };

    const messages = responses[vibe] || responses["neutral"];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Get pet emoji
   */
  private getPetEmoji(vibe: string): string {
    const petEmojis: { [key: string]: string } = {
      thriving: "🐕",
      happy: "🐶",
      neutral: "🐕‍🦺",
      sad: "🐩",
      stressed: "😰",
    };
    return petEmojis[vibe] || "🐕";
  }

  /**
   * Calculate overall vibe across multiple trajectories
   */
  calculateAverageVibe(trajectories: WalletState[][]): VibeState {
    const allVibes = trajectories.map((t) =>
      this.calculateVibe(t[t.length - 1])
    );

    const avgVolatility =
      allVibes.reduce((sum, v) => sum + v.volatilityScore, 0) /
      allVibes.length;
    const avgHealth =
      (100 - avgVolatility) * 0.8 +
      allVibes.reduce((sum, v) => {
        const vibeValue = {
          thriving: 100,
          happy: 80,
          neutral: 60,
          sad: 30,
          stressed: 10,
        };
        return sum + vibeValue[v.vibe];
      }, 0) /
        allVibes.length *
        0.2;

    return {
      vibe: this.mapHealthToVibe(avgHealth, avgVolatility),
      emoji: this.getVibeEmoji(
        this.mapHealthToVibe(avgHealth, avgVolatility)
      ),
      color: this.getVibeColor(
        this.mapHealthToVibe(avgHealth, avgVolatility)
      ),
      petState: this.generatePetState(
        this.mapHealthToVibe(avgHealth, avgVolatility),
        avgHealth
      ),
      petEmoji: this.getPetEmoji(
        this.mapHealthToVibe(avgHealth, avgVolatility)
      ),
      volatilityScore: parseFloat(avgVolatility.toFixed(2)),
      stabilityScore: parseFloat((100 - avgVolatility).toFixed(2)),
    };
  }
}