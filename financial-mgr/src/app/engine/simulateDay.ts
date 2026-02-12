// engine/simulateDay.ts
import { WalletState, EngineNode } from "./types";
import { executeDAG } from "./dag";

export function simulateDay(
  state: WalletState,
  nodes: EngineNode[],
): WalletState {
  const newState = executeDAG(state, nodes);
  newState.day += 1;
  return newState;
}
