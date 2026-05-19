import mongoose from "mongoose";

const scanHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
    },
    pdfPath: {
      type: String,
      default: "",
    },
    summary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const ScanHistory = mongoose.model("ScanHistory", scanHistorySchema);

export default ScanHistory;
