import api from "./api";

/**
 * Send a base64 encoded frame from webcam to the backend
 * for real-time deepfake + liveness checking.
 */
export const predictLive = async (frame, sessionId, action, isMeetingApp = false, isScreenShare = false) => {
  const response = await api.post("/api/predict-live", {
    frame,
    session_id: sessionId,
    action,
    is_meeting_app: isMeetingApp,
    is_screen_share: isScreenShare
  });
  return response.data;
};

/**
 * Reset a live verification session state on the AI server.
 */
export const resetLiveSession = async (sessionId) => {
  const response = await api.post("/api/predict-live/reset", {
    session_id: sessionId,
  });
  return response.data;
};
