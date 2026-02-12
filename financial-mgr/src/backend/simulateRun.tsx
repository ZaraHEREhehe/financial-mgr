export interface SimulationResult {
  balance: number;
  vibe: "happy" | "neutral" | "sad";
  creditScore: number;
  nav: number;
  liquidityRatio: number;
  shockDensity: number;
  recoverySlope: number;
  collapseProbability: number;
  exchangeRates: Record<string, number>;
}

export function simulateRun(
  income: number, 
  expenses: number, 
  day: number
): SimulationResult {
  // Deterministic pseudo-random based on inputs
  const seed = (income * expenses * day) % 1000;
  
  // Core calculations
  const netCashflow = income - expenses;
  
  // Multi-currency exposure
  const exchangeRates = {
    USD: 1.0,
    EUR: 0.85 + (Math.sin(seed * 0.1) * 0.05),
    GBP: 0.73 + (Math.cos(seed * 0.1) * 0.04)
  };

  // Asset portfolio simulation
  const baseNav = netCashflow * (1 + day * 0.02);
  const marketVolatility = (seed % 100) / 100;
  const nav = baseNav * (1 + (marketVolatility - 0.5) * 0.1);
  
  // Credit scoring model
  const debtRatio = expenses / (income + 1);
  const punctuality = Math.min(1, (seed % 100) / 100);
  const baseCreditScore = 850 - (debtRatio * 200) + (punctuality * 100);
  const creditScore = Math.min(850, Math.max(300, Math.floor(baseCreditScore)));
  
  // Vibe determination based on financial health
  let vibe: "happy" | "neutral" | "sad";
  if (netCashflow > 20000 && creditScore > 700) {
    vibe = "happy";
  } else if (netCashflow > 0 && creditScore > 500) {
    vibe = "neutral";
  } else {
    vibe = "sad";
  }

  // Advanced metrics
  const liquidityRatio = Math.min(1, nav / (expenses * 0.1));
  const shockDensity = (day % 10) / 10;
  const recoverySlope = netCashflow > 0 ? 0.45 : -0.23;
  const collapseProbability = debtRatio > 0.8 ? 42.1 : debtRatio > 0.5 ? 15.7 : 2.3;

  return {
    balance: Math.floor(nav),
    vibe,
    creditScore,
    nav: Math.floor(nav * 1000),
    liquidityRatio,
    shockDensity,
    recoverySlope,
    collapseProbability,
    exchangeRates
  };
}