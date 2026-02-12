export interface DailyRecord {
  day: number;
  balance: number;
  creditScore: number;
  assets: Asset[];
  vibeScore: number;
  collapsedFlag: boolean;
}

export interface WalletState {
  date: Date;
  balance: number;
  assets: Asset[];
  liabilities: Liability[];
  creditScore: number;
  dayNumber: number;
  history: DailyRecord[]; // ← ADD THIS
}

export interface Asset {
  id: string;
  name: string;
  amount: number;
  currency: string;
  volatility: number;
  liquidityClass: "liquid" | "illiquid" | "yield" | "volatile";
  lockedUntil?: Date;
  baseValue?: number;
}

export interface Liability {
  id: string;
  type: string;
  principalBalance: number;
  interestRate: number;
  currency: string;
  minimumPayment?: number;
  createdAt: Date;
}

export interface ExchangeRates {
  [key: string]: number | Date;
  timestamp: Date;
}

export interface DailyInput {
  income: number;
  expenses: number;
  currency: string;
  incomeSource?: string;
  expenseCategory?: string;
}

export interface SimulationOutput {
  finalBalance: {
    mean: number;
    percentile5: number;
    percentile95: number;
  };
  collapseProbability: number;
  creditScoreEvolution: number[];
  vibe: "healthy" | "neutral" | "risky";
  liquidityRatio: number;
  nav: number;
  peakBalance: number;
  lowestBalance: number;
}