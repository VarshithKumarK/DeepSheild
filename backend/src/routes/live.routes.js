import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { predictLive, resetLiveSession } from "../controllers/live.controller.js";

const router = express.Router();

// Protected routes for real-time webcam liveness + deepfake checks
router.post("/predict-live", protect, predictLive);
router.post("/predict-live/reset", protect, resetLiveSession);

export default router;
