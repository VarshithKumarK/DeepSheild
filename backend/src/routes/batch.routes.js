import express from "express";
import multer from "multer";
import { batchPredict } from "../controllers/batch.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/batch-predict", upload.array("files"), batchPredict);

export default router;
