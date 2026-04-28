import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import batchRoutes from "./src/routes/batch.routes.js";
import historyRoutes from "./src/routes/history.routes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.options(/.*/, cors());

app.use(express.json());

app.use("/api", batchRoutes);
app.use("/api", historyRoutes);

app.get("/", (req, res) => {
  res.send("DeepShield Backend Running 🚀");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
