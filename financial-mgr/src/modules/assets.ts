import { Asset, WalletState } from "./types";
import { CurrencyEngine } from "./currency";

export class AssetEngine {
  private currencyEngine: CurrencyEngine;
  private liquidationPenalty: { [key: string]: number } = {
    liquid: 0.0, // No penalty
    yield: 0.02, // 2% penalty
    volatile: 0.05, // 5% penalty
    illiquid: 0.1, // 10% penalty
  };

  constructor(currencyEngine: CurrencyEngine) {
    this.currencyEngine = currencyEngine;
  }

  /**
   * Revalue assets daily (volatility-based)
   * @param assets - Array of assets to revalue
   * @param seed - Random seed for deterministic behavior
   */
  revalueAssets(assets: Asset[], seed: number): Asset[] {
    const seededRandom = this.seededRNG(seed);

    return assets.map((asset) => {
      // Generate random shock based on volatility
      const shock = seededRandom() * asset.volatility * 2 - asset.volatility; // Range: [-volatility, +volatility]

      const newAmount = Math.max(0, asset.amount * (1 + shock));

      return {
        ...asset,
        amount: parseFloat(newAmount.toFixed(6)),
      };
    });
  }

  /**
   * Calculate total Net Asset Value (NAV) in base currency
   */
  calculateNAV(assets: Asset[], baseCurrency: string = "USD"): number {
    return assets.reduce((total, asset) => {
      const converted = this.currencyEngine.convert(
        asset.amount,
        asset.currency,
        baseCurrency
      );
      return total + converted;
    }, 0);
  }

  /**
   * Liquidate assets when balance is negative (deficit)
   * Sells from most liquid to least liquid
   * @param assets - Array of assets
   * @param deficitAmount - Amount needed to cover deficit
   */
  liquidateForDeficit(
    assets: Asset[],
    deficitAmount: number
  ): { remainingDeficit: number; liquidatedAssets: Asset[] } {
    const liquidityOrder = ["liquid", "yield", "volatile", "illiquid"];
    let remainingDeficit = deficitAmount;
    const updatedAssets = JSON.parse(JSON.stringify(assets)); // Deep copy

    for (const liquidityClass of liquidityOrder) {
      if (remainingDeficit <= 0) break;

      const classAssets = updatedAssets.filter(
        (a: Asset) => a.liquidityClass === liquidityClass
      );

      for (const asset of classAssets) {
        if (remainingDeficit <= 0) break;

        const sellAmount = Math.min(asset.amount, remainingDeficit);
        const penalty = this.liquidationPenalty[liquidityClass];
        const proceedsBeforePenalty = this.currencyEngine.convert(
          sellAmount,
          asset.currency,
          "USD"
        );
        const proceeds = proceedsBeforePenalty * (1 - penalty);

        asset.amount -= sellAmount;
        remainingDeficit -= proceeds;
      }
    }

    return {
      remainingDeficit: Math.max(0, remainingDeficit),
      liquidatedAssets: updatedAssets,
    };
  }

  /**
   * Check if asset is locked/restricted
   */
  isAssetLocked(asset: Asset, currentDate: Date): boolean {
    if (!asset.lockedUntil) return false;
    return currentDate < asset.lockedUntil;
  }

  /**
   * Get immediately usable funds (liquidity ratio)
   */
  getLiquidFunds(assets: Asset[], baseCurrency: string = "USD"): number {
    return assets
      .filter((a) => a.liquidityClass === "liquid" && !a.lockedUntil)
      .reduce((total, asset) => {
        const converted = this.currencyEngine.convert(
          asset.amount,
          asset.currency,
          baseCurrency
        );
        return total + converted;
      }, 0);
  }

  /**
   * Calculate liquidity ratio
   */
  getLiquidityRatio(state: WalletState): number {
    const totalAssets = this.calculateNAV(state.assets, "USD");
    const liquidFunds = this.getLiquidFunds(state.assets, "USD");
    const totalWealth = state.balance + totalAssets;

    if (totalWealth === 0) return 0;
    return Math.min(liquidFunds / totalWealth, 1);
  }

  /**
   * Yield-generating assets produce income
   */
  applyYield(assets: Asset[], seed: number): Asset[] {
    const seededRandom = this.seededRNG(seed);

    return assets.map((asset) => {
      if (asset.liquidityClass === "yield") {
        const yieldRate = 0.02 + seededRandom() * 0.03; // 2-5% annual yield
        const dailyYield = asset.amount * (yieldRate / 365);

        return {
          ...asset,
          amount: parseFloat((asset.amount + dailyYield).toFixed(6)),
        };
      }
      return asset;
    });
  }

  /**
   * Seeded random number generator for determinism
   */
  private seededRNG(seed: number): () => number {
    let m_w = seed;
    let m_z = 987654321;
    const mask = 0xffffffff;

    return function () {
      m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
      m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
      const result = (((m_z << 16) + (m_w & 65535)) >>> 0) / 4294967296;
      return result;
    };
  }
}