import axios from "axios";
import ScanHistory from "../models/ScanHistory.js";
import Result from "../models/result.model.js";

/**
 * Proxy live frame analysis request to FastAPI and save the result
 * to the scan database when verification is completed.
 */
export const predictLive = async (req, res) => {
  try {
    const { frame, session_id, action, is_meeting_app, is_screen_share } = req.body;

    if (!frame || !session_id || !action) {
      return res.status(400).json({ success: false, error: "Missing frame, session_id, or action" });
    }

    // Call FastAPI AI service
    const response = await axios.post(`${process.env.AI_API_URL}/predict-live`, {
      frame,
      session_id,
      action,
      is_meeting_app: !!is_meeting_app,
      is_screen_share: !!is_screen_share
    });

    const data = response.data;

    // Log in database if verification completes successfully
    // We consider the flow completed when the current action completes (e.g. at the end of the action sequence)
    // or when the final "verify" action is processed.
    const isVerificationComplete = 
      !is_screen_share &&
      data.face_detected && 
      data.trust && 
      (action === "verify" || (action === "turn_right" && data.action_completed));

    if (isVerificationComplete) {
      // Create user scan history entry if user is authenticated
      if (req.user && req.user._id) {
        await ScanHistory.create({
          userId: req.user._id,
          fileName: `Webcam Scan (${session_id.substring(0, 6)})`,
          fileType: "live_webcam",
          label: data.deepfake.label,
          confidence: data.deepfake.confidence,
          summary: {
            trust_score: data.trust.trust_score,
            trust_level: data.trust.trust_level,
            risk_indicator: data.trust.risk_indicator,
            liveness_score: data.liveness.liveness_score,
            blink_verified: data.liveness.blink_verified,
            left_turn_verified: data.liveness.left_turn_verified,
            right_turn_verified: data.liveness.right_turn_verified,
            is_static_spoof: data.liveness.is_static_spoof
          }
        });
      }

      // Create global result entry
      await Result.create({
        fileName: `Webcam Scan (${session_id.substring(0, 6)})`,
        label: data.deepfake.label,
        confidence: data.deepfake.confidence,
        fileType: "live_webcam"
      });
    }

    return res.json(data);
  } catch (err) {
    console.error("Error in Node.js predictLive proxy:", err.message);
    return res.status(500).json({ 
      success: false, 
      error: "Live verification proxy failed",
      details: err.message
    });
  }
};

/**
 * Reset liveness verification state for a session.
 */
export const resetLiveSession = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ success: false, error: "Missing session_id" });
    }

    const response = await axios.post(`${process.env.AI_API_URL}/predict-live/reset`, { session_id });
    return res.json(response.data);
  } catch (err) {
    console.error("Error in resetLiveSession proxy:", err.message);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to reset live session",
      details: err.message 
    });
  }
};
