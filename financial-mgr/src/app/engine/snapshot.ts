// engine/snapshot.ts
import { WalletState, Snapshot } from "./types";
import { cloneState } from "./state";

const snapshots: Record<number, Snapshot> = {};

export function saveSnapshot(state: WalletState) {
  snapshots[state.day] = { day: state.day, state: cloneState(state) };
}

export function restoreSnapshot(day: number): WalletState | null {
  if (!snapshots[day]) return null;
  return cloneState(snapshots[day].state);
}
