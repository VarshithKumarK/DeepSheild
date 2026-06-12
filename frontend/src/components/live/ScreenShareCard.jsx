import { useRef, useEffect, useState } from "react";
import { FiMonitor, FiVideoOff } from "react-icons/fi";

export default function ScreenShareCard({
  isActive,
  onCaptureFrame,
  faceDetected,
  detectedFaces = []
}) {
  const videoRef = useRef(null);
  const [deviceError, setDeviceError] = useState(null);
  const [stream, setStream] = useState(null);
  const [isMeetingApp, setIsMeetingApp] = useState(false);

  // Initialize and clean up Screen Sharing stream
  useEffect(() => {
    if (!isActive) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsMeetingApp(false);
      return;
    }

    const startScreenCapture = async () => {
      try {
        setDeviceError(null);
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 5 } // Low framerate saves CPU/GPU resources
          },
          audio: false
        });
        
        const track = displayStream.getVideoTracks()[0];
        const label = track.label || "";
        const meetingKeywords = ["meet", "zoom", "teams", "webex", "skype"];
        const isMeeting = meetingKeywords.some(keyword => label.toLowerCase().includes(keyword));
        setIsMeetingApp(isMeeting);
        console.log(`[Screen Monitor] Shared stream label: "${label}" | Is Meeting: ${isMeeting}`);

        setStream(displayStream);
        if (videoRef.current) {
          videoRef.current.srcObject = displayStream;
        }

        // Handle if user stops sharing via browser toolbar
        track.onended = () => {
          displayStream.getTracks().forEach(track => track.stop());
          setStream(null);
          setIsMeetingApp(false);
          setDeviceError("Screen sharing stopped by user");
        };
      } catch (err) {
        console.error("Error sharing screen: ", err);
        setDeviceError(err.message || "Failed to share screen");
      }
    };

    startScreenCapture();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  // Frame Capture Interval (1 Frame Per Second)
  useEffect(() => {
    if (!isActive || !onCaptureFrame || !stream || !videoRef.current) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      try {
        const maxDimension = 1024;
        let width = video.videoWidth || 640;
        let height = video.videoHeight || 480;

        if (width > maxDimension || height > maxDimension) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxDimension;
            height = Math.round(maxDimension / aspectRatio);
          } else {
            height = maxDimension;
            width = Math.round(maxDimension * aspectRatio);
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, width, height);
        const imageSrc = canvas.toDataURL("image/jpeg", 0.8); // 80% JPEG compression
        onCaptureFrame(imageSrc, isMeetingApp);
      } catch (e) {
        console.error("Failed to capture screen canvas frame:", e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onCaptureFrame, stream, isMeetingApp]);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
      <div className="absolute top-4 left-5 flex items-center gap-2 z-10">
        <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-indigo-500 animate-pulse' : 'bg-red-500'}`}></span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {isActive ? 'Screen Monitor Active' : 'Monitor Feed Offline'}
        </span>
      </div>

      {isActive && !deviceError ? (
        <div className="relative w-full rounded-xl overflow-hidden border border-white/15 bg-black/40">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto block bg-black"
          />

          {/* Real-Time Bounding Box Overlays */}
          {detectedFaces.map((face, index) => {
            const isSpoof = isMeetingApp && face.liveness.is_static_spoof;
            const isDeepfake = face.deepfake.label.toLowerCase() === 'fake';
            const isThreat = isSpoof || isDeepfake;
            
            let statusLabel = 'REAL';
            if (isSpoof) {
              statusLabel = 'SPOOF';
            } else if (isDeepfake) {
              statusLabel = 'DEEPFAKE';
            }

            return (
              <div
                key={face.face_index}
                className="absolute transition-all duration-300 pointer-events-none z-20"
                style={{
                  left: `${face.box.x * 100}%`,
                  top: `${face.box.y * 100}%`,
                  width: `${face.box.w * 100}%`,
                  height: `${face.box.h * 100}%`,
                  border: `2px solid ${isThreat ? '#ef4444' : '#10b981'}`,
                  borderRadius: '12px',
                  boxShadow: `0 0 12px ${isThreat ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                }}
              >
                <span 
                  className={`absolute -top-6 left-0 px-2 py-0.5 text-[9px] font-black uppercase rounded shadow-md select-none ${
                    isThreat ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                  }`}
                >
                  Speaker #{index + 1} ({statusLabel})
                </span>
              </div>
            );
          })}

          {/* Active Status tag */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
            <span className="text-xs font-medium text-gray-300">
              Session Action: <span className="text-indigo-400 font-bold uppercase">Continuous Scan</span>
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              faceDetected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 animate-pulse'
            }`}>
              {faceDetected ? '✓ Face Detected' : 'Searching Face...'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500 py-16">
          {deviceError ? (
            <div className="flex flex-col items-center justify-center bg-gray-950/90 p-4 text-center rounded-xl border border-red-500/20 max-w-sm">
              <FiVideoOff className="w-12 h-12 text-red-500 mb-2" />
              <p className="text-sm font-semibold text-red-400">Screen Sharing Error</p>
              <p className="text-xs text-gray-500 mt-1">{deviceError}</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                <FiMonitor className="w-8 h-8" />
              </div>
              <p className="font-semibold text-gray-300 mb-1 text-center">Desktop Screen Monitor Ready</p>
              <p className="text-xs text-gray-500 max-w-xs text-center">
                Click start below to share a browser tab, window, or display feed (e.g. Google Meet) to passively analyze faces in real-time.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
