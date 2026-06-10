import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiArrowLeft, FiArrowRight, FiShield, FiCheckCircle } from "react-icons/fi";

export default function LivenessInstructions({ action = "blink", isActionCompleted = false }) {
  const getActionDetails = (act) => {
    switch (act) {
      case "blink":
        return {
          title: "Blink Your Eyes",
          description: "Look straight into the camera and blink slowly a few times to verify user presence.",
          icon: <FiEye className="w-8 h-8 text-indigo-400" />,
          color: "border-indigo-500/20 bg-indigo-500/5",
        };
      case "turn_left":
        return {
          title: "Turn Head Left",
          description: "Rotate your face slowly to the left side so your profile landmarks can be verified.",
          icon: <FiArrowLeft className="w-8 h-8 text-indigo-400" />,
          color: "border-indigo-500/20 bg-indigo-500/5",
        };
      case "turn_right":
        return {
          title: "Turn Head Right",
          description: "Rotate your face slowly to the right side to complete horizontal yaw profiling.",
          icon: <FiArrowRight className="w-8 h-8 text-indigo-400" />,
          color: "border-indigo-500/20 bg-indigo-500/5",
        };
      case "verify":
        return {
          title: "Real-Time Face Scan",
          description: "Running advanced neural networks on facial frames to analyze textures and verify authenticity.",
          icon: <FiShield className="w-8 h-8 text-indigo-400 animate-pulse" />,
          color: "border-indigo-500/20 bg-indigo-500/5",
        };
      case "completed":
        return {
          title: "Verification Complete",
          description: "Biometric and deepfake authenticity verification sequence finished successfully.",
          icon: <FiCheckCircle className="w-8 h-8 text-emerald-400" />,
          color: "border-emerald-500/20 bg-emerald-500/5",
        };
      default:
        return {
          title: "Initializing...",
          description: "Configuring environment, starting webcam, and loading AI weights. Please wait.",
          icon: <FiShield className="w-8 h-8 text-gray-500" />,
          color: "border-white/5 bg-white/[0.01]",
        };
    }
  };

  const details = getActionDetails(action);

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${details.color} flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 min-h-[110px]`}>
      <div className="p-3 bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={action}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {details.icon}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex-1 min-w-0 w-full">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
          <h4 className="font-bold text-base text-white tracking-wide truncate">
            {details.title}
          </h4>
          {isActionCompleted && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
              Completed
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          {details.description}
        </p>
      </div>
    </div>
  );
}
