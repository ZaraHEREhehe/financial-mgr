import React from "react";

interface TimelineProps {
  day: number;
  maxDay: number;
  onChange: (day: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ day, maxDay, onChange }) => {
  const milestones = [1, 7, 14, 21, 30];
  
  return (
    <div className="glass-card p-6 my-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-space-grotesk text-lg font-bold gradient-text">
            Daily Horizon
          </h3>
          <p className="text-xs text-gray-400">High-resolution trajectory</p>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl">
          <span className="text-sm text-gray-400">Day</span>
          <span className="text-2xl font-bold text-white ml-2">{day}</span>
          <span className="text-sm text-gray-400 ml-1">/ {maxDay}</span>
        </div>
      </div>

      <div className="relative mt-6">
        <input
          type="range"
          min={1}
          max={maxDay}
          value={day}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="premium-slider w-full"
        />
        
        {/* Milestone markers */}
        <div className="flex justify-between px-1 mt-2">
          {milestones.map((milestone) => (
            <div key={milestone} className="flex flex-col items-center">
              <div className={`w-1 h-2 rounded-full ${
                day >= milestone ? 'bg-blue-400' : 'bg-white/20'
              }`} />
              <span className={`text-[10px] mt-1 ${
                day >= milestone ? 'text-blue-400' : 'text-gray-600'
              }`}>
                D{milestone}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Stats */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-white/5 rounded-xl p-2">
          <p className="text-[10px] text-gray-400">Horizon</p>
          <p className="text-sm font-bold text-white">{maxDay} Days</p>
        </div>
        <div className="bg-white/5 rounded-xl p-2">
          <p className="text-[10px] text-gray-400">Granularity</p>
          <p className="text-sm font-bold text-white">Daily</p>
        </div>
        <div className="bg-white/5 rounded-xl p-2">
          <p className="text-[10px] text-gray-400">Shock Events</p>
          <p className="text-sm font-bold text-white">{Math.floor(day * 0.3)}</p>
        </div>
      </div>
    </div>
  );
};

export default Timeline;