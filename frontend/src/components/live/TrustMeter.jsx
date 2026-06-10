import { motion } from "framer-motion";

export default function TrustMeter({ 
  trustScore = 0.5, 
  livenessScore = 0.5, 
  deepfakeScore = 0.5, 
  trustLevel = "PENDING", 
  riskIndicator = "PENDING",
  hideLiveness = false
}) {
  // SVG circular properties
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (trustScore * circumference);

  const getMeterColor = (score) => {
    if (score >= 0.75) return "from-emerald-500 to-teal-400";
    if (score >= 0.45) return "from-amber-500 to-orange-400";
    return "from-red-500 to-rose-400";
  };

  const getTextColor = (level) => {
    if (level.includes("HIGH")) return "text-emerald-400";
    if (level.includes("MEDIUM")) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
      <h3 className="font-semibold text-lg text-gray-300 mb-6 w-full text-left">Real-Time Trust Engine</h3>
      
      {/* Central Large Trust Score Indicator */}
      <div className="relative flex items-center justify-center mb-6">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            stroke="rgba(255, 255, 255, 0.05)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <motion.circle
            stroke="url(#trustGradient)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="text-indigo-500" stopColor="currentColor" />
              <stop offset="100%" className="text-purple-400" stopColor="currentColor" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {Math.round(trustScore * 100)}%
          </span>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Trust Score
          </span>
        </div>
      </div>

      {/* Trust Level & Risk Tags */}
      <div className="flex gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Trust:</span>
          <span className={`text-xs font-black tracking-wide ${getTextColor(trustLevel)}`}>
            {trustLevel}
          </span>
        </div>
        <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Risk:</span>
          <span className={`text-xs font-black tracking-wide ${getTextColor(riskIndicator)}`}>
            {riskIndicator}
          </span>
        </div>
      </div>

      {/* Grid of Sub-Scores (Liveness and Deepfake) */}
      {/* Grid of Sub-Scores (Liveness and Deepfake) */}
      <div className={`grid ${hideLiveness ? 'grid-cols-1' : 'grid-cols-2'} gap-4 w-full pt-4 border-t border-white/10`}>
        
        {/* Liveness Mini Meter */}
        {!hideLiveness && (
          <div className="flex flex-col items-center bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
            <span className="text-xs text-gray-400 font-medium mb-1">Liveness Score</span>
            <div className="w-full bg-white/5 rounded-full h-1.5 mb-2 overflow-hidden">
              <motion.div 
                className={`h-full bg-gradient-to-r ${getMeterColor(livenessScore)}`}
                initial={{ width: 0 }}
                animate={{ width: `${livenessScore * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-bold text-white">{Math.round(livenessScore * 100)}%</span>
          </div>
        )}

        {/* Authenticity Mini Meter */}
        <div className="flex flex-col items-center bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
          <span className="text-xs text-gray-400 font-medium mb-1">Authenticity</span>
          <div className="w-full bg-white/5 rounded-full h-1.5 mb-2 overflow-hidden">
            <motion.div 
              className={`h-full bg-gradient-to-r ${getMeterColor(deepfakeScore)}`}
              initial={{ width: 0 }}
              animate={{ width: `${deepfakeScore * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-sm font-bold text-white">{Math.round(deepfakeScore * 100)}%</span>
        </div>

      </div>
    </div>
  );
}
