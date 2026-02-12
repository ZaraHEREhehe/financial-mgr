// engine/dag.ts
import { EngineNode } from "./types";

// Simple topological execution
export function executeDAG(state: any, nodes: EngineNode[]): any {
  const executed = new Set<string>();
  let newState = { ...state };

  function runNode(node: EngineNode) {
    if (executed.has(node.name)) return;
    if (node.dependencies) {
      node.dependencies.forEach((depName) => {
        const depNode = nodes.find((n) => n.name === depName);
        if (depNode) runNode(depNode);
      });
    }
    newState = node.execute(newState);
    executed.add(node.name);
  }

  nodes.forEach(runNode);

  return newState;
}
