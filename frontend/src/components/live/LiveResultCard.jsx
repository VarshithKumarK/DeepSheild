import { motion } from "framer-motion";
import { FiCheckCircle, FiAlertTriangle, FiShield, FiHeart } from "react-icons/fi";

export default function LiveResultCard({ result, onRestart }) {
  if (!result) return null;

  const { deepfake = {}, liveness = {}, trust = {} } = result;
  
  const isReal = deepfake.label === "real";
  const trustColor = trust.trust_level === "HIGH TRUST" 
    ? "border-emerald-500/30 bg-emerald-500/[0.02]" 
    : (trust.trust_level === "MEDIUM TRUST" ? "border-amber-500/30 bg-amber-500/[0.02]" : "border-red-500/30 bg-red-500/[0.02]");

  const badgeColor = trust.trust_level === "HIGH TRUST"
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : (trust.trust_level === "MEDIUM TRUST" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-red-500/10 text-red-400 border-red-500/20");

  const trustTextColor = trust.trust_level === "HIGH TRUST" 
    ? "text-emerald-400" 
    : (trust.trust_level === "MEDIUM TRUST" ? "text-amber-400" : "text-red-400");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel p-6 rounded-2xl border ${trustColor} flex flex-col gap-6`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${badgeColor}`}>
            {trust.trust_level}
          </span>
          <h3 className="font-bold text-xl text-white mt-2">Verification Summary</h3>
        </div>
        <div className="p-3 bg-white/5 rounded-xl">
          {isReal && !liveness.is_static_spoof ? (
            <FiCheckCircle className="w-10 h-10 text-emerald-400" />
          ) : (
            <FiAlertTriangle className="w-10 h-10 text-red-400 animate-pulse" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Trust */}
        <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs text-gray-400 font-semibold mb-1">Final Trust Score</span>
          <span className={`text-3xl font-black ${trustTextColor}`}>
            {Math.round(trust.trust_score * 100)}%
          </span>
          <p className="text-[10px] text-gray-500 mt-1">Weighted Authenticity + Liveness</p>
        </div>

        {/* Deepfake Authenticity */}
        <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs text-gray-400 font-semibold mb-1">Deepfake Authenticity</span>
          <span className="text-3xl font-black text-white">
            {Math.round(deepfake.confidence * 100)}%
          </span>
          <p className="text-[10px] text-gray-500 mt-1">
            Likelihood face is <span className="text-indigo-400 font-semibold uppercase">{deepfake.label}</span>
          </p>
        </div>

        {/* Liveness Score */}
        <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs text-gray-400 font-semibold mb-1">Liveness Verification</span>
          <span className="text-3xl font-black text-white">
            {Math.round(liveness.liveness_score * 100)}%
          </span>
          <p className="text-[10px] text-gray-500 mt-1">
            {liveness.is_static_spoof ? 'Static Spoof Detected' : 'Physical reflex verified'}
          </p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/10 p-4 rounded-xl text-sm leading-relaxed text-gray-300">
        <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
          <FiShield className="text-indigo-400" /> AI Diagnostic Report
        </h4>
        {liveness.is_static_spoof ? (
          <p className="text-red-300">
            <strong>Warning:</strong> Biometric stability analysis indicates zero micro-movements in landmarks. The facial input is classified as a static printed photo or a frozen webcam stream, failing liveness challenge parameters.
          </p>
        ) : isReal ? (
          <p>
            The scanned subject successfully completed the eye blink reflex challenge and directional head rotations. The AI model identified natural skin textures and high-frequency real facial details with <strong>{Math.round(deepfake.confidence * 100)}%</strong> confidence. Real-time liveness score is high, leading to a classification of <strong>{trust.trust_level}</strong>.
          </p>
        ) : (
          <p className="text-red-300">
            <strong>Warning:</strong> The subject successfully completed physical reflexes, but the AI deepfake network detected synthetic digital manipulation, blending discrepancies, or boundary inconsistencies with <strong>{Math.round(deepfake.confidence * 100)}%</strong> confidence. The subject is classified as a <strong>DEEPFAKE SPOOF</strong>.
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onRestart}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-center"
        >
          Verify Another Session
        </button>
      </div>
    </motion.div>
  );
}
