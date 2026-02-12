// src/api/branch.ts
import express from "express";
import { restoreSnapshot } from "../app/engine/snapshot";
import { simulateRun } from "../app/engine/simulateRun";

const router = express.Router();

router.post("/branch", (req, res) => {
  try {
    const { snapshot, changes, days } = req.body;

    // Restore the snapshot
    const state = restoreSnapshot(snapshot);

    // Apply changes for the branch scenario
    if (changes) {
      Object.assign(state, changes);
    }

    // Run the alternative simulation
    const branchResult = simulateRun(state, days || 30);

    res.json({
      success: true,
      history: branchResult,
    });
  } catch (err) {
    console.error("Branch simulation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
