import React, { useState } from "react";

interface SimulationFormProps {
  onRunSimulation: (income: number, expenses: number) => void;
  isLoading?: boolean;
}

const SimulationForm: React.FC<SimulationFormProps> = ({ 
  onRunSimulation, 
  isLoading = false 
}) => {
  const [income, setIncome] = useState<string>("75000");
  const [expenses, setExpenses] = useState<string>("45000");
  const [currency, setCurrency] = useState<string>("USD");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunSimulation(parseFloat(income) || 0, parseFloat(expenses) || 0);
  };

  return (
    <div className="glass-card p-6 my-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-600 rounded-full" />
        <div>
          <h3 className="font-space-grotesk text-lg font-bold gradient-text">
            Simulation Parameters
          </h3>
          <p className="text-xs text-gray-400">Multi-currency • DAG resolution</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {/* Income Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Annual Income
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                {currency === 'USD' ? '$' : '€'}
              </span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="premium-input w-full pl-10"
                placeholder="75000"
                disabled={isLoading}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">After-tax • Realized gains</p>
          </div>

          {/* Expenses Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Annual Expenses
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                {currency === 'USD' ? '$' : '€'}
              </span>
              <input
                type="number"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                className="premium-input w-full pl-10"
                placeholder="45000"
                disabled={isLoading}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Fixed + variable • Liability-adjusted</p>
          </div>

          {/* Currency Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Base Currency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['USD', 'EUR', 'GBP'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                    currency === c
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Exchange rate: 1.00 (floating daily)</p>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="premium-button w-full mt-4 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Computing Trajectory...
                </>
              ) : (
                <>
                  <span>⚡ Execute Simulation</span>
                  <span className="text-xs opacity-70">v1.0</span>
                </>
              )}
            </span>
          </button>
        </div>
      </form>

      {/* Metadata */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Deterministic Engine • Seed: 0x7F3A</span>
          <span>DAG Resolution • Bit-exact</span>
        </div>
      </div>
    </div>
  );
};

export default SimulationForm;