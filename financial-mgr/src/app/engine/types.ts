// engine/types.ts

export type Currency = "USD" | "EUR" | "PKR";

export interface Asset {
  name: string;
  type: "cash" | "stock" | "property" | "savings";
  value: number;
  liquid: boolean;
  locked?: boolean;
}

export interface WalletState {
  day: number;
  balance: Record<Currency, number>;
  assets: Asset[];
  creditScore: number;
  transactions: string[]; // optional log
  vibe: "happy" | "neutral" | "sad";
}

export interface EngineNode {
  name: string;
  execute: (state: WalletState) => WalletState;
  dependencies?: string[];
}

export interface Snapshot {
  day: number;
  state: WalletState;
}
