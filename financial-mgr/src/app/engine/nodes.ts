// engine/nodes.ts
import { EngineNode } from "./types";
import { seededRandom } from "./seed";

export const nodes: EngineNode[] = [
  {
    name: "income",
    execute: (state) => {
      state.balance.USD += 100;
      return state;
    },
  },
  {
    name: "expenses",
    dependencies: ["income"],
    execute: (state) => {
      state.balance.USD -= 50;
      return state;
    },
  },
  {
    name: "vibe",
    dependencies: ["income", "expenses"],
    execute: (state) => {
      state.vibe = state.balance.USD > 1000 ? "happy" : "neutral";
      return state;
    },
  },
];
