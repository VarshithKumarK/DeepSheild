import axios from "axios";
import FormData from "form-data";
import Result from "../models/result.model.js";

export const processFile = async (file, includeExplanation = false, includeHeatmap = false) => {
  const formData = new FormData();
  formData.append("file", file.buffer, file.originalname);

  const isVideo = file.mimetype.startsWith("video");
  const endpoint = isVideo ? `/predict-video?explain=${includeExplanation}&include_frames=true&include_heatmap=${includeHeatmap}` : `/predict`;

  const response = await axios.post(
    `${process.env.AI_API_URL}${endpoint}`,
    formData,
    { headers: formData.getHeaders() }
  );

  const data = response.data;
  console.log("AI Response:", data);

  await Result.create({
    fileName: file.originalname,
    label: data.label,
    confidence: data.confidence,
    fileType: file.mimetype.includes("video") ? "video" : "image"
  });

  return {
    fileName: file.originalname,
    fileType: isVideo ? "video" : "image",
    label: data.label,
    confidence: data.confidence,
    explanation: data.explanation,
    signals: data.signals,
    heatmap: data.heatmap,
    summary: data.summary,
    frames: data.frames
  };
};
