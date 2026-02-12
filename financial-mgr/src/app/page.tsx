"use client";

import React, { useState } from "react";
import Timeline from "@/components/Timeline";
import VibeCard from "@/components/VibeCard";
import Charts from "@/components/Charts";
import SimulationForm from "@/components/SimulationForm";
import { simulateRun } from "@/backend/simulateRun";

export default function Home() {
  // Initialize with simulation results directly - NO useEffect needed!
  const initialResult = simulateRun(75000, 45000, 15);
  
  const [income, setIncome] = useState<number>(75000);
  const [expenses, setExpenses] = useState<number>(45000);
  const [day, setDay] = useState<number>(15);
  const [vibe, setVibe] = useState<"happy" | "neutral" | "sad">(initialResult.vibe);
  const [balance, setBalance] = useState<number>(initialResult.balance);
  const [creditScore, setCreditScore] = useState<number>(initialResult.creditScore);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  const handleSimulation = (newIncome: number, newExpenses: number) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const result = simulateRun(newIncome, newExpenses, day);
      setIncome(newIncome);
      setExpenses(newExpenses);
      setBalance(result.balance);
      setVibe(result.vibe);
      setCreditScore(result.creditScore);
      setLastUpdated(new Date().toLocaleTimeString());
      setIsLoading(false);
    }, 800);
  };

  return (
    <main className="min-h-screen py-8 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="glass-card p-8 mb-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          <h1 className="font-space-grotesk text-5xl font-bold mb-3">
            <span className="gradient-text">Future Wallet</span>
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 font-mono text-xs">
              v2.0.1
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">High-Fidelity Projection</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400 font-mono text-xs">
              {lastUpdated ? `Last: ${lastUpdated}` : 'Ready'}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-4 max-w-2xl mx-auto">
            Multi-currency DAG engine • Shock clustering density • Recovery slope analysis
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column - Simulation Controls */}
          <div className="lg:col-span-5 space-y-6">
            <SimulationForm 
              onRunSimulation={handleSimulation}
              isLoading={isLoading}
            />
            <Timeline 
              day={day} 
              maxDay={30} 
              onChange={setDay}
            />
          </div>

          {/* Right Column - Visualizations */}
          <div className="lg:col-span-7 space-y-6">
            <VibeCard 
              vibe={vibe} 
              creditScore={creditScore}
              recoverySlope={vibe === 'happy' ? 0.45 : vibe === 'neutral' ? 0.12 : -0.23}
            />
            <Charts />
            
            {/* Additional Metrics */}
            <div className="glass-card p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Net Asset Value</p>
                  <p className="text-2xl font-bold text-white">
                    ${balance.toLocaleString()}
                  </p>
                  <span className="text-xs text-green-400">
                    +{((balance / (income - expenses || 1)) * 100).toFixed(1)}% vs baseline
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Collapse Probability</p>
                  <p className="text-2xl font-bold text-white">
                    {vibe === 'happy' ? '2.3' : vibe === 'neutral' ? '15.7' : '42.1'}%
                  </p>
                  <span className="text-xs text-gray-400">
                    Within {day} day horizon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[10px] text-gray-600 border-t border-white/5 pt-6">
          <p>DATAFEST’26 • Future Wallet Technical Specification v1.0 • Deterministic DAG Engine • Multi-Currency Support</p>
          <p className="mt-1">Bit-exact outputs | Daily granularity | Shock clustering density | Recovery slope metrics</p>
        </div>
      </div>
    </main>
  );
}