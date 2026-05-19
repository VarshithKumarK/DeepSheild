import express from "express";
import multer from "multer";
import {
  getProfile,
  updateProfile,
  changePassword,
  getStats,
  getHistory,
  uploadAvatar
} from "../controllers/profile.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getProfile);
router.put("/", updateProfile);
router.put("/change-password", changePassword);
router.get("/stats", getStats);
router.get("/history", getHistory);
router.post("/avatar", upload.single("avatar"), uploadAvatar);

export default router;
