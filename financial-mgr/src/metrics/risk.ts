import { WalletState } from "@/modules/types";

export interface RiskMetrics {
  collapseProbability: number; // 0-1, probability of balance < 0
  collapseTimings: number[]; // Days when collapse occurred in simulations
  averageCollapsDay: number; // Average day of collapse
  recoveryRate: number; // % of runs that recovered after collapse
  maxDrawdown: number; // Worst balance dip as % of peak
}

export class RiskEngine {
  /**
   * Calculate bankruptcy/collapse probability across multiple runs
   * @param trajectories - Array of simulation runs (each with history)
   * @returns Risk metrics
   */
  calculateCollapseProbability(trajectories: WalletState[][]): RiskMetrics {
    const collapseTimings: number[] = [];
    let recoveredCount = 0;

    trajectories.forEach((trajectory) => {
      let hasCollapsed = false;
      let collapsedDay = -1;
      let recoveredAfter = false;

      trajectory.forEach((state, dayIndex) => {
        // Detect collapse (balance < 0)
        if (state.balance < 0 && !hasCollapsed) {
          hasCollapsed = true;
          collapsedDay = dayIndex;
          collapseTimings.push(dayIndex);
        }

        // Detect recovery after collapse
        if (hasCollapsed && collapsedDay > -1 && state.balance > 0) {
          recoveredAfter = true;
        }
      });

      if (recoveredAfter) {
        recoveredCount++;
      }
    });

    const collapseProbability = collapseTimings.length / trajectories.length;
    const averageCollapsDay =
      collapseTimings.length > 0
        ? collapseTimings.reduce((a, b) => a + b, 0) / collapseTimings.length
        : -1;

    const recoveryRate =
      collapseTimings.length > 0
        ? recoveredCount / collapseTimings.length
        : 1; // If no collapse, 100% recovery rate

    return {
      collapseProbability: parseFloat(collapseProbability.toFixed(4)),
      collapseTimings,
      averageCollapsDay:
        averageCollapsDay > 0 ? Math.round(averageCollapsDay) : 0,
      recoveryRate: parseFloat(recoveryRate.toFixed(4)),
      maxDrawdown: this.calculateMaxDrawdown(trajectories),
    };
  }

  /**
   * Calculate maximum drawdown (worst peak-to-trough as %)
   */
  private calculateMaxDrawdown(trajectories: WalletState[][]): number {
    let worstDrawdown = 0;

    trajectories.forEach((trajectory) => {
      let peak = trajectory[0].balance;
      let trough = peak;

      trajectory.forEach((state) => {
        if (state.balance > peak) {
          peak = state.balance;
        }
        if (state.balance < trough) {
          trough = state.balance;
        }

        const drawdown = peak > 0 ? (peak - trough) / peak : 0;
        if (drawdown > worstDrawdown) {
          worstDrawdown = drawdown;
        }
      });
    });

    return parseFloat((worstDrawdown * 100).toFixed(2));
  }

  /**
   * Calculate Value at Risk (VaR) - balance at given percentile
   * @param trajectories - Simulation runs
   * @param percentile - e.g., 0.05 for 5th percentile
   * @returns Balance at that percentile
   */
  calculateVaR(trajectories: WalletState[][], percentile: number): number {
    const finalBalances = trajectories.map((t) => t[t.length - 1].balance);
    const sorted = [...finalBalances].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * percentile);
    return sorted[Math.max(0, index)];
  }

  /**
   * Calculate Conditional Value at Risk (CVaR) - average of worst X%
   */
  calculateCVaR(trajectories: WalletState[][], percentile: number): number {
    const finalBalances = trajectories.map((t) => t[t.length - 1].balance);
    const sorted = [...finalBalances].sort((a, b) => a - b);
    const cutoffIndex = Math.floor(sorted.length * percentile);
    const worstValues = sorted.slice(0, cutoffIndex + 1);

    return (
      worstValues.reduce((a, b) => a + b, 0) / worstValues.length
    );
  }

  /**
   * Determine risk level (for UI display)
   */
  getRiskLevel(
    collapseProbability: number
  ): "low" | "moderate" | "high" | "critical" {
    if (collapseProbability < 0.1) return "low";
    if (collapseProbability < 0.25) return "moderate";
    if (collapseProbability < 0.5) return "high";
    return "critical";
  }

  /**
   * Shock clustering density - frequency of negative days
   * @param trajectory - Single simulation run
   * @returns Density as 0-1
   */
  calculateShockClusteringDensity(trajectory: WalletState[]): number {
    const negativeDays = trajectory.filter(
      (state) => state.balance < 0 || (state.history && state.history[state.history.length - 1]?.balance < 0)
    ).length;

    return parseFloat((negativeDays / trajectory.length).toFixed(4));
  }

  /**
   * Recovery slope - how fast balance recovers from deficit
   * @param trajectory - Single simulation run
   * @returns Days to recover from deficit (or -1 if didn't recover)
   */
  calculateRecoverySlope(trajectory: WalletState[]): number {
    let collapseDay = -1;
    let recoveryDay = -1;

    trajectory.forEach((state, day) => {
      if (collapseDay === -1 && state.balance < 0) {
        collapseDay = day;
      }
      if (collapseDay > -1 && recoveryDay === -1 && state.balance >= 0) {
        recoveryDay = day;
      }
    });

    if (collapseDay === -1 || recoveryDay === -1) {
      return -1; // No collapse or no recovery
    }

    return recoveryDay - collapseDay;
  }

  /**
   * Average recovery slope across all runs
   */
  calculateAverageRecoverySlope(trajectories: WalletState[][]): number {
    const slopes = trajectories
      .map((t) => this.calculateRecoverySlope(t))
      .filter((s) => s > 0);

    if (slopes.length === 0) return 0;
    return Math.round(
      slopes.reduce((a, b) => a + b, 0) / slopes.length
    );
  }
}