import React from "react";

interface VibeCardProps {
  vibe: "happy" | "neutral" | "sad";
  creditScore?: number;
  recoverySlope?: number;
}

const VibeCard: React.FC<VibeCardProps> = ({ 
  vibe, 
  creditScore = 720,
  recoverySlope = 0.45 
}) => {
  const vibeConfig = {
    happy: {
      bg: "bg-gradient-to-br from-emerald-500/20 to-green-500/5",
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/20",
      emoji: "😄",
      title: "FINANCIAL HARMONY",
      description: "Recovery slope: +0.45 | Shock resilience: High",
      color: "text-emerald-400"
    },
    neutral: {
      bg: "bg-gradient-to-br from-yellow-500/20 to-amber-500/5",
      border: "border-yellow-500/30",
      glow: "shadow-yellow-500/20",
      emoji: "😐",
      title: "STABLE PLATEAU",
      description: "Recovery slope: +0.12 | Shock resilience: Moderate",
      color: "text-yellow-400"
    },
    sad: {
      bg: "bg-gradient-to-br from-red-500/20 to-rose-500/5",
      border: "border-red-500/30",
      glow: "shadow-red-500/20",
      emoji: "😟",
      title: "STRESS SIGNATURE",
      description: "Recovery slope: -0.23 | Shock clustering: Critical",
      color: "text-red-400"
    }
  };

  const config = vibeConfig[vibe];

  return (
    <div className={`glass-card p-6 ${config.bg} border ${config.border} ${config.glow} transition-all duration-500 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="text-6xl animate-float">{config.emoji}</div>
          <div>
            <div className={`font-space-grotesk text-sm font-bold ${config.color} tracking-wider`}>
              {config.title}
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {vibe === "happy" && "Optimal"}
              {vibe === "neutral" && "Sustainable"}
              {vibe === "sad" && "At Risk"}
            </div>
            <p className="text-xs text-gray-400 mt-2">{config.description}</p>
          </div>
        </div>
        
        {/* Credit Score Gauge */}
        <div className="text-right">
          <div className="text-sm text-gray-400">Credit Score</div>
          <div className={`text-3xl font-bold ${config.color}`}>{creditScore}</div>
          <div className="text-xs text-gray-400 mt-1">RSI: {recoverySlope.toFixed(2)}</div>
        </div>
      </div>
      
      {/* Shock Clustering Density Indicator */}
      <div className="mt-4 grid grid-cols-5 gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full ${
              i < (vibe === "happy" ? 1 : vibe === "neutral" ? 3 : 4)
                ? vibe === "happy"
                  ? "bg-emerald-500"
                  : vibe === "neutral"
                  ? "bg-yellow-500"
                  : "bg-red-500"
                : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] text-gray-500 mt-2">
        Shock Clustering Density • Recovery Slope Trajectory
      </p>
    </div>
  );
};

export default VibeCard;