// engine/testSimulation.ts
import { createInitialState } from "./state";
import { simulateRun } from "./simulateRun";
import { nodes } from "./nodes";
import { saveSnapshot, restoreSnapshot } from "./snapshot";

// Step 1: Create initial wallet state
const initialState = createInitialState();

// Step 2: Run a 10-day simulation
const history = simulateRun(initialState, nodes, 10);

// Step 3: Save a snapshot of day 5
saveSnapshot(history[4]);

// Step 4: Restore snapshot (example)
const restored = restoreSnapshot(4);

console.log("Simulation History:", history);
console.log("Restored Day 5:", restored);
