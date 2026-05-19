import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiCheck, FiPlay, FiAlertCircle, FiX, FiLoader } from 'react-icons/fi';
import UploadZone from '../components/UploadZone';
import FileCard from '../components/FileCard';
import ResultCard from '../components/ResultCard';
import api from '../services/api';

export default function UploadDashboard() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [options, setOptions] = useState({
    explainability: true,
    pdfReport: true,
    heatmaps: true,
    frameAnalysis: false
  });

  const handleToggle = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileSelect = (newFiles) => {
    const mappedFiles = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      preview: URL.createObjectURL(file)
    }));
    
    setFiles(prev => [...prev, ...mappedFiles]);
    setError(null);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setError(null);
  };

  const analyzeFiles = async () => {
    if (files.length === 0) {
      setError("Please select at least one file to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    
    // Update status to processing
    setFiles(prev => prev.map(f => ({ ...f, status: 'processing' })));

    const formData = new FormData();
    files.forEach(f => {
      formData.append("files", f.file);
    });

    // Append options to formData to match backend expectations
    formData.append("includeVideoExplanation", options.explainability);
    formData.append("includeVideoHeatmap", options.heatmaps);
    formData.append("frameAnalysis", options.frameAnalysis);

    try {
      const response = await api.post("/api/batch-predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.results) {
        // Enhance results with preview URLs from the corresponding file
        const enhancedResults = response.data.results.map(res => {
          const matchedFile = files.find(f => f.name === res.fileName);
          return {
            ...res,
            previewUrl: matchedFile ? matchedFile.preview : null
          };
        });
        
        setResults(enhancedResults);
        setFiles(prev => prev.map(f => ({ ...f, status: 'completed' })));
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.response?.data?.message || err.message || "Failed to analyze files. Please try again.");
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analysis Dashboard</h1>
        <p className="text-gray-400">Upload and process your media. All analysis is performed securely.</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 relative"
          >
            <FiAlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-400 mb-1">Analysis Failed</h4>
              <p className="text-sm text-red-200/80">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400/50 hover:text-red-400 absolute top-4 right-4">
              <FiX className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Upload & Controls */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <UploadZone onFileSelect={handleFileSelect} />
          
          {/* Options Panel */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <FiSettings className="text-indigo-400" />
              <h3 className="font-semibold text-lg">Processing Options</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'explainability', label: 'Enable Explainability' },
                { key: 'pdfReport', label: 'Generate PDF Report' },
                { key: 'heatmaps', label: 'Include Heatmaps' },
                { key: 'frameAnalysis', label: 'Include Frame Analysis (Video)' }
              ].map((opt) => (
                <div key={opt.key} className="flex items-center justify-between group">
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{opt.label}</span>
                  <button 
                    onClick={() => handleToggle(opt.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0b0f19] ${options[opt.key] ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${options[opt.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={analyzeFiles}
              disabled={loading || files.length === 0}
              className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-semibold shadow-lg transition-all active:scale-95 ${
                loading || files.length === 0 
                ? 'bg-indigo-600/50 text-white/50 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
              }`}
            >
              {loading ? (
                <><FiLoader className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                <><FiPlay className="w-5 h-5" /> Analyze Files</>
              )}
            </button>
            <button 
              onClick={clearAll}
              disabled={loading}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10 active:scale-95 disabled:opacity-50"
            >
              Clear
            </button>
          </div>

          {/* File List */}
          <div className="mt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Uploaded Files</h3>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full font-bold border border-indigo-500/20">
                {files.length} selected
              </span>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {files.map(file => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <FileCard file={file} onRemove={removeFile} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="w-full lg:w-2/3">
          <div className={`glass-panel p-6 rounded-2xl h-full border-t-4 transition-colors ${results.length > 0 ? 'border-t-emerald-500' : 'border-t-indigo-500'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiCheck className={results.length > 0 ? 'text-emerald-400' : 'text-gray-600'} /> Results
              </h2>
              {loading && (
                <div className="flex gap-2">
                  <span className="text-xs text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    AI Analyzing...
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <AnimatePresence>
                {results.map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                  >
                    <ResultCard result={result} options={options} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {results.length === 0 && !loading && (
                <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <FiPlay className="w-8 h-8 text-gray-400 opacity-50" />
                  </div>
                  <p>No results yet. Upload and analyze files to see results here.</p>
                </div>
              )}

              {loading && results.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center">
                  <FiLoader className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                  <p className="text-indigo-300 font-medium animate-pulse">Running advanced deepfake models...</p>
                  <p className="text-xs text-gray-500 mt-2">This may take a few moments depending on file size.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
