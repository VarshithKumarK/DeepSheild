import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  fileName: String,
  label: String,
  confidence: Number,
  fileType: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Result = mongoose.model("Result", resultSchema);
export default Result;
