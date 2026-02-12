import { WalletState } from "@/modules/types";
import { VibeEngine, VibeState } from "./vibe";
import { RiskEngine, RiskMetrics } from "./risk";

export interface StatisticsOutput {
  finalBalance: {
    mean: number;
    median: number;
    percentile5: number;
    percentile95: number;
    min: number;
    max: number;
    stdDev: number;
  };
  creditScore: {
    mean: number;
    evolution: number[]; // Credit scores over time
    finalDistribution: { [key: string]: number }; // Tiers: excellent, good, fair, poor, bad
  };
  assets: {
    nav: number; // Net Asset Value
    averageNAV: number;
    liquidityRatio: number;
  };
  risk: RiskMetrics;
  vibe: VibeState;
}

export class StatsEngine {
  private vibeEngine: VibeEngine;
  private riskEngine: RiskEngine;

  constructor() {
    this.vibeEngine = new VibeEngine();
    this.riskEngine = new RiskEngine();
  }

  /**
   * Generate complete statistics packet from multiple simulation runs
   * This is what gets returned to the frontend
   */
  generateStatistics(trajectories: WalletState[][]): StatisticsOutput {
    const finalBalances = trajectories.map((t) => t[t.length - 1].balance);
    const finalCreditScores = trajectories.map(
      (t) => t[t.length - 1].creditScore
    );

    return {
      finalBalance: this.calculateBalanceStats(finalBalances),
      creditScore: this.calculateCreditStats(trajectories, finalCreditScores),
      assets: this.calculateAssetStats(trajectories),
      risk: this.riskEngine.calculateCollapseProbability(trajectories),
      vibe: this.vibeEngine.calculateAverageVibe(trajectories),
    };
  }

  /**
   * Calculate balance statistics
   */
  private calculateBalanceStats(
    balances: number[]
  ): StatisticsOutput["finalBalance"] {
    const sorted = [...balances].sort((a, b) => a - b);

    const mean = balances.reduce((a, b) => a + b, 0) / balances.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const percentile5 = sorted[Math.floor(sorted.length * 0.05)];
    const percentile95 = sorted[Math.floor(sorted.length * 0.95)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    const variance =
      balances.reduce((sum, b) => sum + Math.pow(b - mean, 2), 0) /
      balances.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean: parseFloat(mean.toFixed(2)),
      median: parseFloat(median.toFixed(2)),
      percentile5: parseFloat(percentile5.toFixed(2)),
      percentile95: parseFloat(percentile95.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      stdDev: parseFloat(stdDev.toFixed(2)),
    };
  }

  /**
   * Calculate credit score statistics
   */
  private calculateCreditStats(
    trajectories: WalletState[][],
    finalCreditScores: number[]
  ): StatisticsOutput["creditScore"] {
    const mean =
      finalCreditScores.reduce((a, b) => a + b, 0) / finalCreditScores.length;

    // Collect all credit scores across all days and runs
    const allScores: number[] = [];
    trajectories.forEach((trajectory) => {
      trajectory.forEach((state) => {
        allScores.push(state.creditScore);
      });
    });

    // Categorize credit scores
    const distribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      bad: 0,
    };

    finalCreditScores.forEach((score) => {
      if (score >= 750) distribution.excellent++;
      else if (score >= 670) distribution.good++;
      else if (score >= 580) distribution.fair++;
      else if (score >= 450) distribution.poor++;
      else distribution.bad++;
    });

    // Normalize to percentages
    const total = finalCreditScores.length;
    const normalizedDistribution = {
      excellent: parseFloat(((distribution.excellent / total) * 100).toFixed(2)),
      good: parseFloat(((distribution.good / total) * 100).toFixed(2)),
      fair: parseFloat(((distribution.fair / total) * 100).toFixed(2)),
      poor: parseFloat(((distribution.poor / total) * 100).toFixed(2)),
      bad: parseFloat(((distribution.bad / total) * 100).toFixed(2)),
    };

    // Get evolution (sample from first trajectory)
    const evolution =
      trajectories.length > 0
        ? trajectories[0].map((state) => state.creditScore)
        : [];

    return {
      mean: parseFloat(mean.toFixed(2)),
      evolution,
      finalDistribution: normalizedDistribution,
    };
  }

  /**
   * Calculate asset statistics
   */
  private calculateAssetStats(trajectories: WalletState[][]): StatisticsOutput["assets"] {
    let totalNAV = 0;
    let totalLiquidityRatio = 0;

    trajectories.forEach((trajectory) => {
      const finalState = trajectory[trajectory.length - 1];

      // Calculate NAV for this trajectory
      const nav = finalState.assets.reduce((sum, asset) => {
        return sum + asset.amount;
      }, 0);
      totalNAV += nav;

      // Calculate liquidity ratio
      const liquidAssets = finalState.assets
        .filter((a) => a.liquidityClass === "liquid")
        .reduce((sum, a) => sum + a.amount, 0);
      const totalAssets = nav;

      const ratio = totalAssets > 0 ? liquidAssets / totalAssets : 0;
      totalLiquidityRatio += ratio;
    });

    const averageNAV = totalNAV / trajectories.length;
    const averageLiquidityRatio = totalLiquidityRatio / trajectories.length;

    return {
      nav: parseFloat(averageNAV.toFixed(2)),
      averageNAV: parseFloat(averageNAV.toFixed(2)),
      liquidityRatio: parseFloat(
        Math.min(averageLiquidityRatio, 1).toFixed(4)
      ),
    };
  }

  /**
   * Calculate RSI (Resilience Score Index) - how well user bounces back from shocks
   * Scale: 0-100
   */
  calculateRSI(trajectory: WalletState[]): number {
    const shocks: number[] = [];
    const recoveries: number[] = [];

    // Find all negative balance periods (shocks)
    for (let i = 1; i < trajectory.length; i++) {
      const prev = trajectory[i - 1].balance;
      const curr = trajectory[i].balance;

      if (prev >= 0 && curr < 0) {
        // Shock detected
        shocks.push(i);

        // Find recovery
        for (let j = i + 1; j < trajectory.length; j++) {
          if (trajectory[j].balance >= 0) {
            recoveries.push(j - i); // Days to recover
            break;
          }
        }
      }
    }

    if (recoveries.length === 0) return 100; // No shocks = high resilience

    const avgRecoveryTime =
      recoveries.reduce((a, b) => a + b) / recoveries.length;
    const recoveryQuality = 100 - Math.min(avgRecoveryTime / 50, 100); // Normalized

    return parseFloat(recoveryQuality.toFixed(2));
  }

  /**
   * Generate summary narrative (for judges)
   */
  generateNarrative(stats: StatisticsOutput): string {
    const vibeEmoji = stats.vibe.emoji;
    const health = stats.vibe.vibe;
    const riskLevel = this.getRiskLevel(stats.risk.collapseProbability);

    return `
Your Financial Forecast ${vibeEmoji}:

💰 Balance: $${stats.finalBalance.mean.toFixed(2)} (median)
  • 5th percentile: $${stats.finalBalance.percentile5.toFixed(2)}
  • 95th percentile: $${stats.finalBalance.percentile95.toFixed(2)}

📊 Credit Score: ${stats.creditScore.mean.toFixed(0)} (${this.getCreditTier(stats.creditScore.mean)})

⚠️ Risk Level: ${riskLevel.toUpperCase()}
  • Collapse probability: ${(stats.risk.collapseProbability * 100).toFixed(1)}%
  • Recovery rate: ${(stats.risk.recoveryRate * 100).toFixed(1)}%

💪 Financial Health: ${health.toUpperCase()}
  • Stability: ${stats.vibe.stabilityScore}/100
  • Volatility: ${stats.vibe.volatilityScore}/100

🐕 Pet Says: "${stats.vibe.petState}"
    `.trim();
  }

  /**
   * Helper: Map collapse probability to risk level
   */
  private getRiskLevel(
    prob: number
  ): "low" | "moderate" | "high" | "critical" {
    if (prob < 0.1) return "low";
    if (prob < 0.25) return "moderate";
    if (prob < 0.5) return "high";
    return "critical";
  }

  /**
   * Helper: Map credit score to tier
   */
  private getCreditTier(
    score: number
  ): "excellent" | "good" | "fair" | "poor" | "bad" {
    if (score >= 750) return "excellent";
    if (score >= 670) return "good";
    if (score >= 580) return "fair";
    if (score >= 450) return "poor";
    return "bad";
  }
}