import { motion } from 'framer-motion';
import { FiImage, FiVideo } from 'react-icons/fi';

export default function ActivityCard({ scan }) {
  const isFake = scan.result === 'Fake' || scan.result?.toLowerCase() === 'fake';
  const confidenceColor = isFake ? 'text-red-400' : 'text-emerald-400';
  const badgeBg = isFake ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';

  return (
    <motion.div 
      whileHover={{ scale: 1.01, x: 4 }}
      className="flex items-center justify-between p-4 rounded-xl bg-gray-800/40 border border-white/5 hover:bg-indigo-900/30 hover:border-indigo-500/30 transition-all group flex-wrap gap-4 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${scan.type === 'video' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
          {scan.type === 'video' ? <FiVideo className="w-5 h-5" /> : <FiImage className="w-5 h-5" />}
        </div>
        <div>
          <h4 className="font-medium text-gray-200 mb-1">{scan.fileName}</h4>
          <p className="text-xs text-gray-500">{scan.date}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 ml-auto">
        <div className="hidden md:block text-right">
          <p className="text-xs text-gray-500 mb-1">Confidence</p>
          <p className={`text-sm font-bold ${confidenceColor}`}>{scan.confidence}%</p>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeBg}`}>
          {scan.result}
        </div>
      </div>
    </motion.div>
  );
}
