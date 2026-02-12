import React from "react";

const Charts: React.FC = () => {
  return (
    <div className="glass-card p-6 my-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-space-grotesk text-lg font-bold gradient-text">
            Asset Trajectory
          </h3>
          <p className="text-xs text-gray-400 mt-1">NAV & Liquidity Projection</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-500/20 rounded-full text-xs font-medium text-blue-400">
            1D
          </span>
          <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-gray-400">
            1W
          </span>
          <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-gray-400">
            1M
          </span>
        </div>
      </div>

      {/* Animated Chart Placeholder */}
      <div className="relative h-48 w-full">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-white/5 w-full h-0"></div>
          ))}
        </div>
        
        {/* Animated line chart simulation */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00b4d8" />
              <stop offset="100%" stopColor="#6a5acd" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00b4d8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6a5acd" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <path
            d="M0,120 L20,100 L40,80 L60,90 L80,70 L100,60 L120,50 L140,40 L160,30 L180,40 L200,50 L220,60 L240,55 L260,45 L280,35 L300,30 L320,40 L340,50 L360,60 L380,70 L400,80 L420,90 L440,85 L460,75 L480,65 L500,70 L520,80 L540,90 L560,85 L580,80 L600,75 L620,70 L640,68 L660,65 L680,60 L700,55 L720,50 L740,48 L760,45 L780,42 L800,40 L820,38 L840,35 L860,33 L880,30 L900,28 L920,25 L940,23 L960,20 L980,15 L1000,10 L1000,192 L0,192 Z"
            fill="url(#areaGradient)"
            opacity="0.6"
          />
          
          {/* Line */}
          <path
            d="M0,120 L20,100 L40,80 L60,90 L80,70 L100,60 L120,50 L140,40 L160,30 L180,40 L200,50 L220,60 L240,55 L260,45 L280,35 L300,30 L320,40 L340,50 L360,60 L380,70 L400,80 L420,90 L440,85 L460,75 L480,65 L500,70 L520,80 L540,90 L560,85 L580,80 L600,75 L620,70 L640,68 L660,65 L680,60 L700,55 L720,50 L740,48 L760,45 L780,42 L800,40 L820,38 L840,35 L860,33 L880,30 L900,28 L920,25 L940,23 L960,20 L980,15 L1000,10"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            fill="none"
            className="drop-shadow-lg"
          />
          
          {/* Data points */}
          {[0, 200, 400, 600, 800, 1000].map((x, i) => (
            <circle
              key={i}
              cx={x}
              cy={[120, 70, 50, 45, 30, 10][i]}
              r="4"
              fill="white"
              className="animate-pulse"
            >
              <animate
                attributeName="r"
                values="4;6;4"
                dur="2s"
                repeatCount="indefinite"
                begin={`${i * 0.3}s`}
              />
            </circle>
          ))}
        </svg>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-gray-400">NAV</p>
          <p className="text-lg font-bold text-white">$2.4M</p>
          <span className="text-xs text-green-400">+12.3%</span>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-gray-400">Liquidity</p>
          <p className="text-lg font-bold text-white">68%</p>
          <span className="text-xs text-yellow-400">Adequate</span>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-gray-400">Volatility</p>
          <p className="text-lg font-bold text-white">23.5</p>
          <span className="text-xs text-blue-400">Low</span>
        </div>
      </div>
    </div>
  );
};

export default Charts;