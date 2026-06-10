import { useState } from 'react';
import { FiDownload, FiChevronDown, FiChevronUp, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { generateImagePDF, generateVideoPDF } from '../utils/pdfGenerator';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResultCard({ result, options }) {
  const [expanded, setExpanded] = useState(false);
  
  // Robust check for video vs image
  const isVideo = result.type === 'video' || (result.summary && result.summary.total_frames !== undefined) || result.frames?.length > 0;
  
  // Standardize the fake check
  const isFake = result.label && result.label.toLowerCase() === 'fake';

  const handleDownloadPDF = () => {
    if (isVideo) {
      generateVideoPDF(result, options || { includeExplanation: true, includeHeatmap: true, includeFrames: true });
    } else {
      generateImagePDF(result);
    }
  };

  // Convert confidence to a percentage format (e.g., 0.984 -> 98.4%)
  const formatConfidence = (conf) => {
    if (typeof conf === 'number') {
       if (conf <= 1) return (conf * 100).toFixed(1);
       return conf.toFixed(1);
    }
    return conf;
  };

  const confidencePercentage = formatConfidence(result.confidence);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border-white/5 flex flex-col">
      <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 bg-white/[0.01]">
        <div>
          <h3 className="font-semibold text-lg text-white mb-1 truncate max-w-[250px] sm:max-w-[400px]">{result.fileName}</h3>
          <p className="text-sm text-gray-400">{isVideo ? 'Video Analysis' : 'Image Analysis'}</p>
        </div>
        <div className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
          isFake ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>
          {isFake ? <FiAlertTriangle className="w-3.5 h-3.5" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
          {isFake ? 'DEEPFAKE DETECTED' : 'AUTHENTIC'}
        </div>
      </div>

      <div className="p-5 flex-1">
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Confidence Score</span>
            <span className="font-mono font-bold text-white">{confidencePercentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${isFake ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
              style={{ width: `${confidencePercentage}%` }}
            ></div>
          </div>
        </div>

        {/* IMAGE PREVIEW (If image has heatmap) */}
        {!isVideo && result.heatmap && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#0b0f19] rounded-xl p-2 border border-white/5 aspect-video relative group overflow-hidden">
              {result.previewUrl ? (
                <img src={result.previewUrl} alt="Original" className="w-full h-full object-contain" />
              ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">Original Preview</div>
              )}
            </div>
            <div className="bg-[#0b0f19] rounded-xl p-2 border border-white/5 aspect-video relative group overflow-hidden flex flex-col items-center justify-center">
              <img 
                src={`data:image/jpeg;base64,${result.heatmap}`} 
                alt="Heatmap" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* VIDEO SUMMARY */}
        {isVideo && result.summary && (
           <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0b0f19] p-3 rounded-xl border border-white/5 text-center">
                 <div className="text-2xl font-bold text-white">{result.summary.total_frames}</div>
                 <div className="text-xs text-gray-400">Total Frames</div>
              </div>
              <div className="bg-[#0b0f19] p-3 rounded-xl border border-red-500/20 text-center">
                 <div className="text-2xl font-bold text-red-400">{result.summary.fake_frames}</div>
                 <div className="text-xs text-red-500/70">Fake Frames</div>
              </div>
              <div className="bg-[#0b0f19] p-3 rounded-xl border border-emerald-500/20 text-center">
                 <div className="text-2xl font-bold text-emerald-400">{result.summary.real_frames}</div>
                 <div className="text-xs text-emerald-500/70">Real Frames</div>
              </div>
           </div>
        )}

        {/* AI EXPLANATION */}
        {result.explanation && (
          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 mb-4">
            <h4 className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wider">AI Explanation</h4>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {result.explanation}
            </p>
          </div>
        )}

        {/* EXPANDABLE FRAME ANALYSIS FOR VIDEOS */}
        {isVideo && result.frames && result.frames.length > 0 && (
          <div className="mt-4 border border-white/5 rounded-xl overflow-hidden bg-white/[0.01]">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="w-full p-3 flex justify-between items-center text-sm font-medium hover:bg-white/5 transition-colors"
            >
              <span>Frame Analysis ({result.frames.length} key frames)</span>
              {expanded ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4 border-t border-white/5 space-y-6 overflow-hidden"
                >
                  {result.frames.map((frame, idx) => (
                    <div key={idx} className="bg-[#0b0f19] p-4 rounded-lg border border-white/5">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-semibold text-sm">Frame {frame.frame_id}</h5>
                        <span className={`text-xs px-2 py-0.5 rounded ${frame.label === 'fake' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {frame.label.toUpperCase()} ({formatConfidence(frame.confidence)}%)
                        </span>
                      </div>
                      
                      {frame.explanation && (
                         <p className="text-xs text-gray-400 mb-3">{frame.explanation}</p>
                      )}

                      {frame.heatmap && (
                        <div className="w-full max-w-[200px] aspect-video bg-black rounded overflow-hidden">
                           <img 
                            src={`data:image/jpeg;base64,${frame.heatmap}`} 
                            alt={`Frame ${frame.frame_id} heatmap`} 
                            className="w-full h-full object-contain"
                           />
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-sm text-gray-500">
           {isVideo ? 'Video analysis complete' : 'Image analysis complete'}
        </div>
        <button 
          onClick={handleDownloadPDF}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 rounded-lg text-sm font-medium text-indigo-300 hover:text-white transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          Download PDF
        </button>
      </div>
    </div>
  );
}
