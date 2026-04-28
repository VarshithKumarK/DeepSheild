import express from "express";
import { getHistory } from "../controllers/history.controller.js";

const router = express.Router();

router.get("/history", getHistory);

export default router;
