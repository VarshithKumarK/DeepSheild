import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import batchRoutes from "./src/routes/batch.routes.js";
import historyRoutes from "./src/routes/history.routes.js";
import profileRoutes from "./src/routes/profile.routes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.options(/.*/, cors());

import { protect } from "./src/middlewares/auth.middleware.js";

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", protect, batchRoutes);
app.use("/api", protect, historyRoutes);
app.use("/api/profile", protect, profileRoutes);

app.get("/", (req, res) => {
  res.send("DeepShield Backend Running 🚀");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
