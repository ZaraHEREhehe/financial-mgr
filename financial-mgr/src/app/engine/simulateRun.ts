// engine/simulateRun.ts
import { WalletState, EngineNode } from "./types";
import { simulateDay } from "./simulateDay";
import { cloneState } from "./state";

export function simulateRun(
  initialState: WalletState,
  nodes: EngineNode[],
  totalDays: number,
): WalletState[] {
  const history: WalletState[] = [];
  let state = cloneState(initialState);

  for (let day = 0; day < totalDays; day++) {
    state = simulateDay(state, nodes);
    history.push(cloneState(state));
  }

  return history;
}
