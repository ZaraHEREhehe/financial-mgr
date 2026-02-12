// engine/state.ts
import { WalletState } from "./types";

export function createInitialState(): WalletState {
  return {
    day: 0,
    balance: { USD: 1000, EUR: 0, PKR: 0 },
    assets: [],
    creditScore: 700,
    transactions: [],
    vibe: "neutral",
  };
}

// Deep clone state for snapshots / immutability
export function cloneState(state: WalletState): WalletState {
  return JSON.parse(JSON.stringify(state));
}
