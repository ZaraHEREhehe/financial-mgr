// src/app/api/simulate.ts
import express from "express";
import { simulateRun } from "../app/engine/simulateRun";
import { initState } from "../app/engine/state";
import { parseUserInput } from "../app/engine/types";

const router = express.Router();

router.post("/simulate", (req, res) => {
  try {
    const userInput = req.body;

    // Validate & parse inputs
    const initialState = parseUserInput(userInput);

    // Run the simulation
    const result = simulateRun(initialState, userInput.days || 30);

    res.json({
      success: true,
      days: result.length,
      history: result,
    });
  } catch (err) {
    console.error("Simulation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
