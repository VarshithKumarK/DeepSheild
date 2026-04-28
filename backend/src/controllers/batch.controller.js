import { processFile } from "../services/batch.service.js";

export const batchPredict = async (req, res) => {
  try {
    const files = req.files;
    const includeHeatmap = req.body.includeVideoHeatmap === "true";
    const includeExplanation = req.body.includeVideoExplanation === "true";

    const results = [];

    for (const file of files) {
      const result = await processFile(file, includeExplanation, includeHeatmap);
      console.log("Processed Result:", result);
      results.push(result);
    }

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Batch processing failed" });
  }
};
