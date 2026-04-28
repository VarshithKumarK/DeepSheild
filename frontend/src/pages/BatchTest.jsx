import { useState } from "react";
import axios from "axios";
import { generateImagePDF, generateVideoPDF } from "../utils/pdfGenerator";

export default function BatchTest() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [includeVideoExplanation, setIncludeVideoExplanation] = useState(false);
  const [includeVideoHeatmap, setIncludeVideoHeatmap] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("includeVideoHeatmap", includeVideoHeatmap);
    formData.append("includeVideoExplanation", includeVideoExplanation);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/batch-predict",
        formData,
      );

      setResults(res.data.results || [res.data]);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Deepfake Detector (Batch)
        </h1>

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Processing..." : "Upload & Analyze"}
        </button>

        <div className="mt-4 flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeVideoHeatmap}
              onChange={(e) => setIncludeVideoHeatmap(e.target.checked)}
            />
            Include Video Heatmaps in PDF
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeVideoExplanation}
              onChange={(e) => setIncludeVideoExplanation(e.target.checked)}
            />
            Include Video Explanations in PDF
          </label>
        </div>

        <div className="mt-6 space-y-4">
          {results.map((item, i) => (
            <div key={i} className="p-4 border rounded-lg bg-gray-50">
              <p>
                <strong>File:</strong> {item.fileName}
              </p>

              <p>
                <strong>Label:</strong>{" "}
                <span
                  className={
                    item.label === "fake" ? "text-red-500" : "text-green-500"
                  }
                >
                  {item.label}
                </span>
              </p>

              <p>
                <strong>Confidence:</strong> {item.confidence}
              </p>

              <button
                onClick={() => {
                  if (item.fileName.endsWith(".mp4")) {
                    generateVideoPDF(item, {
                      includeFrames: true,
                      includeHeatmap: includeVideoHeatmap,
                      includeExplanation: includeVideoExplanation,
                    });
                  } else {
                    generateImagePDF(item);
                  }
                }}
                className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
              >
                Download PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
