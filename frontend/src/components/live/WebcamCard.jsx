import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { FiCamera, FiVideoOff } from "react-icons/fi";
import { motion } from "framer-motion";

export default function WebcamCard({
  isActive,
  onCaptureFrame,
  isAnalyzing,
  currentAction,
  faceDetected
}) {
  const webcamRef = useRef(null);
  const [deviceError, setDeviceError] = useState(null);

  // Capture frame handler called by parent interval
  useEffect(() => {
    if (!isActive || !onCaptureFrame) return;

    const interval = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          onCaptureFrame(imageSrc);
        }
      }
    }, 1000); // 1 frame per second as per rules

    return () => clearInterval(interval);
  }, [isActive, onCaptureFrame]);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
      <div className="absolute top-4 left-5 flex items-center gap-2 z-10">
        <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {isActive ? 'Camera Feed Active' : 'Camera Feed Offline'}
        </span>
      </div>

      {isActive ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/15 bg-black/40">
          {/* react-webcam integration */}
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.8} // Compress base64 jpeg to 80% quality
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror camera
            onUserMediaError={(err) => setDeviceError(err.message || "Failed to access webcam")}
          />

          {/* Biometric Face Guide Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Corner Bracket Borders */}
            <div className="absolute w-[240px] h-[280px] rounded-[40px] border-2 border-dashed border-indigo-500/40 flex items-center justify-center">
              <div className="absolute w-[248px] h-[288px] rounded-[42px] border border-indigo-400/20"></div>
            </div>
            
            {/* Tech Scan Line */}
            {isAnalyzing && (
              <motion.div
                initial={{ y: -140 }}
                animate={{ y: 140 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 2.2,
                  ease: "easeInOut"
                }}
                className="absolute w-[240px] h-[3px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_#6366f1]"
              />
            )}
          </div>

          {/* Action Instruction and Face Status tag */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
            <span className="text-xs font-medium text-gray-300">
              Instruction: <span className="text-indigo-400 font-bold capitalize">{currentAction?.replace('_', ' ')}</span>
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              faceDetected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 animate-pulse'
            }`}>
              {faceDetected ? '✓ Face Tracked' : 'Searching Face...'}
            </span>
          </div>

          {deviceError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/90 p-4 text-center">
              <FiVideoOff className="w-12 h-12 text-red-500 mb-2" />
              <p className="text-sm font-semibold text-red-400">Camera Access Error</p>
              <p className="text-xs text-gray-500 mt-1">{deviceError}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500 py-16">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
            <FiCamera className="w-8 h-8" />
          </div>
          <p className="font-semibold text-gray-300 mb-1 text-center">Biometric Verification Locked</p>
          <p className="text-xs text-gray-500 max-w-xs text-center">
            Click start below to initialize your web camera and begin the multi-step real-time trust verification.
          </p>
        </div>
      )}
    </div>
  );
}
