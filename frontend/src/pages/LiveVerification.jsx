import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCamera, FiAlertCircle, FiRotateCcw } from "react-icons/fi";
import { predictLive, resetLiveSession } from "../services/liveApi";
import WebcamCard from "../components/live/WebcamCard";
import TrustMeter from "../components/live/TrustMeter";
import VerificationStatus from "../components/live/VerificationStatus";
import LivenessInstructions from "../components/live/LivenessInstructions";
import LiveResultCard from "../components/live/LiveResultCard";

// Sequence steps definition for camera guided KYC flow
const STEPS = {
  0: { action: "blink", label: "Face Tracked" },
  1: { action: "blink", label: "Blink Challenge" },
  2: { action: "turn_left", label: "Turn Left" },
  3: { action: "turn_right", label: "Turn Right" },
  4: { action: "verify", label: "Final Scan" },
  5: { action: "completed", label: "Finished" }
};

export default function LiveVerification() {
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  
  // Scoring States
  const [scores, setScores] = useState({
    trustScore: 0.5,
    livenessScore: 0.5,
    deepfakeScore: 0.5,
    trustLevel: "PENDING",
    riskIndicator: "PENDING"
  });

  // Checklist verified flags
  const [checklist, setChecklist] = useState({
    blinkVerified: false,
    leftTurnVerified: false,
    rightTurnVerified: false,
    isStaticSpoof: false,
    deepfakeComplete: false
  });

  const [error, setError] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [lockRequest, setLockRequest] = useState(false);

  // Initialize a new verification session
  const startVerification = async () => {
    const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSessionId(uuid);
    setCurrentStep(1); // Go to step 1 (Blink eyes)
    setFaceDetected(false);
    setScores({
      trustScore: 0.5,
      livenessScore: 0.5,
      deepfakeScore: 0.5,
      trustLevel: "INITIALIZING",
      riskIndicator: "INITIALIZING"
    });
    setChecklist({
      blinkVerified: false,
      leftTurnVerified: false,
      rightTurnVerified: false,
      isStaticSpoof: false,
      deepfakeComplete: false
    });
    setFinalResult(null);
    setError(null);
    setIsActive(true);
  };

  const stopVerification = async () => {
    setIsActive(false);
    if (sessionId) {
      try {
        await resetLiveSession(sessionId);
      } catch (err) {
        console.error("Failed to reset session:", err);
      }
    }
    setSessionId(null);
    setCurrentStep(0);
    setFaceDetected(false);
  };

  // Frame processing from the WebcamCard
  const handleCaptureFrame = async (base64Frame) => {
    if (lockRequest || !sessionId || currentStep === 0 || currentStep >= 5) return;
    
    setLockRequest(true);
    setIsAnalyzing(true);
    setError(null);

    const stepAction = STEPS[currentStep].action;

    try {
      const res = await predictLive(base64Frame, sessionId, stepAction);
      
      if (!res.face_detected) {
        setFaceDetected(false);
        setError(res.error || "Please position your face clearly in the camera center.");
        setLockRequest(false);
        setIsAnalyzing(false);
        return;
      }

      setFaceDetected(true);
      
      // Update checklist flags
      setChecklist({
        blinkVerified: res.liveness.blink_verified,
        leftTurnVerified: res.liveness.left_turn_verified,
        rightTurnVerified: res.liveness.right_turn_verified,
        isStaticSpoof: res.liveness.is_static_spoof,
        deepfakeComplete: currentStep === 4 && res.deepfake ? true : false
      });

      // Update scoring states
      setScores({
        trustScore: res.trust.trust_score,
        livenessScore: res.liveness.liveness_score,
        deepfakeScore: res.deepfake.authenticity_score,
        trustLevel: res.trust.trust_level,
        riskIndicator: res.trust.risk_indicator
      });

      // Handle step transition
      if (res.action_completed) {
        if (currentStep < 4) {
          // Advance to the next challenge step
          setCurrentStep(prev => prev + 1);
        } else if (currentStep === 4) {
          // Final Deepfake assessment complete
          setCurrentStep(5);
          setFinalResult(res);
          setIsActive(false);
        }
      } else if (currentStep === 4) {
        // If we are on the final verify step, it automatically finishes on the next frame
        setCurrentStep(5);
        setFinalResult(res);
        setIsActive(false);
      }

    } catch (err) {
      console.error("Frame analysis error:", err);
      setError(err.response?.data?.error || "Connection failure with real-time AI engine.");
    } finally {
      setIsAnalyzing(false);
      setLockRequest(false);
    }
  };

  // Reset session handler for retry button
  const handleRestart = () => {
    startVerification();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Biometric Live Verification</h1>
          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Real-time biometric liveness and deepfake authentication. This process verifies that you are physical, responsive, and checks for synthetic face swaps.
          </p>
        </div>
        
        {isActive && (
          <button
            onClick={stopVerification}
            className="self-start md:self-auto px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 font-bold transition-all text-sm active:scale-95 flex items-center gap-2"
          >
            <FiRotateCcw className="w-4 h-4" /> Cancel Session
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
        
        {/* Left 2 Columns: Webcam Card and instructions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <WebcamCard
            isActive={isActive}
            onCaptureFrame={handleCaptureFrame}
            isAnalyzing={isAnalyzing}
            currentAction={STEPS[currentStep].action}
            faceDetected={faceDetected}
          />
          
          <LivenessInstructions
            action={STEPS[currentStep].action}
            isActionCompleted={currentStep > 1 && checklist.blinkVerified}
          />

          {!isActive && !finalResult && (
            <div className="flex gap-4">
              <button
                onClick={startVerification}
                className="flex-1 flex justify-center items-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95 text-lg"
              >
                <FiCamera className="w-6 h-6" /> Start Live Scan
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Trust Meter & Checklists OR Live Results */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {finalResult ? (
              <LiveResultCard
                result={finalResult}
                onRestart={handleRestart}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6"
              >
                <TrustMeter
                  trustScore={scores.trustScore}
                  livenessScore={scores.livenessScore}
                  deepfakeScore={scores.deepfakeScore}
                  trustLevel={scores.trustLevel}
                  riskIndicator={scores.riskIndicator}
                />
                
                <VerificationStatus
                  faceDetected={faceDetected}
                  blinkVerified={checklist.blinkVerified}
                  leftTurnVerified={checklist.leftTurnVerified}
                  rightTurnVerified={checklist.rightTurnVerified}
                  isStaticSpoof={checklist.isStaticSpoof}
                  deepfakeComplete={checklist.deepfakeComplete}
                  currentAction={STEPS[currentStep].action}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
