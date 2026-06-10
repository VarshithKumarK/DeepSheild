import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMonitor, FiAlertCircle, FiActivity, FiShield, FiXCircle, FiRotateCcw } from "react-icons/fi";
import { predictLive, resetLiveSession } from "../services/liveApi";
import ScreenShareCard from "../components/live/ScreenShareCard";
import TrustMeter from "../components/live/TrustMeter";

export default function ScreenMonitor() {
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  
  // Real-time scan log history state
  const [scanLogs, setScanLogs] = useState([]);
  
  // Scoring States
  const [scores, setScores] = useState({
    trustScore: 0.5,
    livenessScore: 0.5,
    deepfakeScore: 0.5,
    trustLevel: "PENDING",
    riskIndicator: "PENDING"
  });

  const [checklist, setChecklist] = useState({
    isStaticSpoof: false,
    deepfakeComplete: false
  });

  const [error, setError] = useState(null);
  const [lockRequest, setLockRequest] = useState(false);

  // Initialize a new monitoring session
  const startMonitoring = async () => {
    const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSessionId(uuid);
    setFaceDetected(false);
    setFrameCount(0);
    setScanLogs([]);
    setScores({
      trustScore: 0.5,
      livenessScore: 0.5,
      deepfakeScore: 0.5,
      trustLevel: "MONITORING",
      riskIndicator: "EVALUATING"
    });
    setChecklist({
      isStaticSpoof: false,
      deepfakeComplete: false
    });
    setError(null);
    setIsActive(true);
  };

  const stopMonitoring = async () => {
    setIsActive(false);
    if (sessionId) {
      try {
        await resetLiveSession(sessionId);
      } catch (err) {
        console.error("Failed to reset session:", err);
      }
    }
    setSessionId(null);
    setFaceDetected(false);
  };

  // Frame processing from ScreenShareCard
  const handleCaptureFrame = async (base64Frame, isMeetingApp) => {
    if (lockRequest || !sessionId) return;
    
    setLockRequest(true);
    setIsAnalyzing(true);
    setError(null);

    const timestamp = new Date().toLocaleTimeString();
    const currentFrameNum = frameCount + 1;
    setFrameCount(currentFrameNum);

    try {
      const res = await predictLive(base64Frame, sessionId, "verify", isMeetingApp, true);
      
      if (!res.face_detected) {
        setFaceDetected(false);
        setError(res.error || "No active presenter face detected in shared window.");
        
        // Log frame failure in history console
        const logEntry = {
          id: Math.random().toString(36).substring(7),
          frame: currentFrameNum,
          time: timestamp,
          faceDetected: false,
          status: "NO FACE"
        };
        setScanLogs(prev => [logEntry, ...prev].slice(0, 10)); // Keep last 10 frames
        
        setLockRequest(false);
        setIsAnalyzing(false);
        return;
      }

      setFaceDetected(true);
      
      setChecklist({
        isStaticSpoof: res.liveness.is_static_spoof,
        deepfakeComplete: res.deepfake ? true : false
      });

      setScores({
        trustScore: res.trust.trust_score,
        livenessScore: res.liveness.liveness_score,
        deepfakeScore: res.deepfake.authenticity_score,
        trustLevel: res.trust.trust_level,
        riskIndicator: res.trust.risk_indicator
      });

      // Log frame prediction success in history console
      const logEntry = {
        id: Math.random().toString(36).substring(7),
        frame: currentFrameNum,
        time: timestamp,
        faceDetected: true,
        label: res.deepfake.label,
        confidence: res.deepfake.confidence,
        isStaticSpoof: res.liveness.is_static_spoof,
        status: res.liveness.is_static_spoof 
          ? "SPOOF DETECTED" 
          : `${res.deepfake.label.toUpperCase()} (${(res.deepfake.confidence * 100).toFixed(1)}%)`
      };
      setScanLogs(prev => [logEntry, ...prev].slice(0, 10));

    } catch (err) {
      console.error("Screen analysis error:", err);
      setError(err.response?.data?.error || "Connection failure with real-time AI engine.");
      
      const logEntry = {
        id: Math.random().toString(36).substring(7),
        frame: currentFrameNum,
        time: timestamp,
        faceDetected: false,
        status: "ERROR"
      };
      setScanLogs(prev => [logEntry, ...prev].slice(0, 10));
    } finally {
      setIsAnalyzing(false);
      setLockRequest(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Desktop Screen Monitor</h1>
          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Passive real-time deepfake checks on screen streams. Share your screen, browser, or Google Meet window to evaluate the authenticity of speakers.
          </p>
        </div>
        
        {isActive && (
          <button
            onClick={stopMonitoring}
            className="self-start md:self-auto px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 font-bold transition-all text-sm active:scale-95 flex items-center gap-2"
          >
            <FiRotateCcw className="w-4 h-4" /> Stop Monitoring
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3 relative shadow-lg shadow-yellow-500/5"
          >
            <FiAlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-400 mb-0.5">Biometric Tracker Guidance</h4>
              <p className="text-sm text-yellow-200/80 leading-relaxed">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Screen Share feed and dynamic logging console */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ScreenShareCard
            isActive={isActive}
            onCaptureFrame={handleCaptureFrame}
            faceDetected={faceDetected}
          />
          
          {/* Dynamic real-time frame scanning log console */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white tracking-wide flex items-center gap-2">
                <FiActivity className="text-indigo-400 animate-pulse" /> Real-Time Frame Scan Log
              </h3>
              <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-gray-400 font-mono">
                Interval: 1 FPS
              </span>
            </div>
            
            <div className="max-h-[220px] overflow-y-auto font-mono text-xs flex flex-col gap-2 scrollbar-thin">
              <AnimatePresence>
                {scanLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      log.status.includes("REAL")
                        ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                        : log.status.includes("NO FACE")
                        ? "border-yellow-500/10 bg-yellow-500/[0.01]"
                        : "border-red-500/20 bg-red-500/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">[{log.time}]</span>
                      <span className="font-bold text-gray-300">Frame #{log.frame}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-black ${
                        log.status.includes("REAL")
                          ? "text-emerald-400"
                          : log.status.includes("NO FACE")
                          ? "text-yellow-400"
                          : "text-red-400 animate-pulse"
                      }`}>
                        {log.status}
                      </span>
                      {log.isStaticSpoof && (
                        <span className="bg-red-500/15 border border-red-500/30 text-red-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          SPOOF
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {scanLogs.length === 0 && (
                <div className="py-12 text-center text-gray-600 italic">
                  Waiting for screen monitoring stream to initialize...
                </div>
              )}
            </div>
          </div>
          
          {!isActive && (
            <button
              onClick={startMonitoring}
              className="flex justify-center items-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95 text-lg"
            >
              <FiMonitor className="w-6 h-6" /> Start Screen Share Monitor
            </button>
          )}
        </div>

        {/* Right Column: Gauges and Passive Status checklists */}
        <div className="flex flex-col gap-6">
          <TrustMeter
            trustScore={scores.trustScore}
            livenessScore={scores.livenessScore}
            deepfakeScore={scores.deepfakeScore}
            trustLevel={scores.trustLevel}
            riskIndicator={scores.riskIndicator}
            hideLiveness={true}
          />
          
          {/* Custom Passive Biometric diagnostics console */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
            <h3 className="font-semibold text-lg text-gray-300">Biometric Diagnostics Console</h3>
            
            <div className="flex flex-col gap-3">
              {/* Check 1: Presenter detection */}
              <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                faceDetected ? "border-emerald-500/15 bg-emerald-500/[0.01]" : "border-white/5 opacity-55"
              }`}>
                <FiMonitor className={`w-5 h-5 mt-0.5 flex-shrink-0 ${faceDetected ? "text-emerald-400" : "text-gray-600"}`} />
                <div>
                  <h4 className="text-sm font-semibold text-gray-200">Presenter Face Tracker</h4>
                  <p className="text-xs text-gray-500">
                    {faceDetected ? "Active face located inside shared window" : "Waiting for face bounding-box lock"}
                  </p>
                </div>
              </div>

              {/* Check 2: Stability validation */}
              <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                faceDetected && checklist.isStaticSpoof
                  ? "border-red-500/20 bg-red-500/[0.02]"
                  : faceDetected
                  ? "border-emerald-500/15 bg-emerald-500/[0.01]"
                  : "border-white/5 opacity-55"
              }`}>
                {faceDetected && checklist.isStaticSpoof ? (
                  <FiXCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500 animate-bounce" />
                ) : (
                  <FiShield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${faceDetected ? "text-emerald-400" : "text-gray-600"}`} />
                )}
                <div>
                  <h4 className="text-sm font-semibold text-gray-200">Anti-Spoofing Stability</h4>
                  <p className="text-xs text-gray-500">
                    {faceDetected && checklist.isStaticSpoof 
                      ? "ALERT: Static photo or frozen stream detected!"
                      : faceDetected
                      ? "Natural face tremor and motion verified"
                      : "Evaluating screen coordinates"}
                  </p>
                </div>
              </div>

              {/* Check 3: Deepfake classification */}
              <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                faceDetected && checklist.deepfakeComplete
                  ? "border-emerald-500/15 bg-emerald-500/[0.01]"
                  : "border-white/5 opacity-55"
              }`}>
                <FiShield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${faceDetected && checklist.deepfakeComplete ? "text-emerald-400" : "text-gray-600"}`} />
                <div>
                  <h4 className="text-sm font-semibold text-gray-200">Deepfake Texture Scan</h4>
                  <p className="text-xs text-gray-500">
                    {faceDetected && checklist.deepfakeComplete
                      ? "Neural networks analyzing pixel consistency"
                      : "Awaiting face alignment frame"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
