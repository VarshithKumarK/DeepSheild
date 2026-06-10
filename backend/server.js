import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import batchRoutes from "./src/routes/batch.routes.js";
import historyRoutes from "./src/routes/history.routes.js";
import profileRoutes from "./src/routes/profile.routes.js";
import liveRoutes from "./src/routes/live.routes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.options(/.*/, cors());

import { protect } from "./src/middlewares/auth.middleware.js";

// Request size logging middleware to monitor payload bandwidth
app.use((req, res, next) => {
  if (req.path === "/api/predict-live") {
    const size = req.headers["content-length"];
    if (size) {
      const mb = (parseInt(size, 10) / (1024 * 1024)).toFixed(3);
      console.log(`[Proxy Request] POST /api/predict-live - Payload size: ${mb} MB`);
    } else {
      console.log("[Proxy Request] POST /api/predict-live - Payload size: unknown");
    }
  }
  next();
});

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api", protect, batchRoutes);
app.use("/api", protect, historyRoutes);
app.use("/api/profile", protect, profileRoutes);
app.use("/api", liveRoutes);

app.get("/", (req, res) => {
  res.send("DeepShield Backend Running 🚀");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
