import { FiCheckCircle, FiClock, FiAlertTriangle, FiActivity } from "react-icons/fi";

export default function VerificationStatus({
  faceDetected = false,
  blinkVerified = false,
  leftTurnVerified = false,
  rightTurnVerified = false,
  isStaticSpoof = false,
  deepfakeComplete = false,
  currentAction = ""
}) {
  const items = [
    {
      id: "face",
      label: "Face Landmark Detection",
      description: "Localizes key biometric landmarks",
      status: faceDetected ? "success" : "pending"
    },
    {
      id: "blink",
      label: "Eye Blink Challenge",
      description: "Verifies human reflex responsiveness",
      status: blinkVerified ? "success" : (currentAction === "blink" ? "active" : "pending")
    },
    {
      id: "turn_left",
      label: "Head Turn Challenge (Left)",
      description: "Detects structural yaw movement left",
      status: leftTurnVerified ? "success" : (currentAction === "turn_left" ? "active" : "pending")
    },
    {
      id: "turn_right",
      label: "Head Turn Challenge (Right)",
      description: "Detects structural yaw movement right",
      status: rightTurnVerified ? "success" : (currentAction === "turn_right" ? "active" : "pending")
    },
    {
      id: "spoof",
      label: "Biometric Stability Scan",
      description: "Blocks static photos & print attacks",
      status: isStaticSpoof ? "error" : (faceDetected ? "success" : "pending")
    },
    {
      id: "deepfake",
      label: "AI Deepfake Analysis",
      description: "Evaluates synthetic noise patterns",
      status: deepfakeComplete ? "success" : "pending"
    }
  ];

  const renderIcon = (status) => {
    switch (status) {
      case "success":
        return <FiCheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
      case "error":
        return <FiAlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 animate-bounce" />;
      case "active":
        return <FiActivity className="w-5 h-5 text-indigo-400 flex-shrink-0 animate-pulse" />;
      default:
        return <FiClock className="w-5 h-5 text-gray-600 flex-shrink-0" />;
    }
  };

  const getRowStyle = (status) => {
    switch (status) {
      case "success":
        return "border-emerald-500/10 bg-emerald-500/[0.01]";
      case "error":
        return "border-red-500/20 bg-red-500/[0.02]";
      case "active":
        return "border-indigo-500/30 bg-indigo-500/[0.03] shadow-md shadow-indigo-500/5";
      default:
        return "border-white/5 opacity-55";
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
      <h3 className="font-semibold text-lg text-gray-300">Biometric Verification Checklist</h3>
      
      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-300 ${getRowStyle(
              item.status
            )}`}
          >
            <div className="mt-0.5">{renderIcon(item.status)}</div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-semibold truncate ${
                item.status === 'active' ? 'text-indigo-300' : (item.status === 'success' ? 'text-gray-200' : 'text-gray-400')
              }`}>
                {item.label}
              </h4>
              <p className="text-xs text-gray-500 truncate">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
