import { useRef } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function UploadZone({ onFileSelect }) {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(Array.from(e.dataTransfer.files));
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(Array.from(e.target.files));
    }
    // Reset input to allow selecting the same file again if needed
    e.target.value = null;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className="relative glass-panel rounded-2xl border-2 border-dashed border-indigo-500/30 hover:border-indigo-500 transition-colors p-8 sm:p-12 text-center cursor-pointer overflow-hidden group"
    >
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" 
        multiple 
        accept="image/jpeg, image/png, video/mp4, video/quicktime"
      />
      <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <FiUploadCloud className="w-10 h-10 text-indigo-400" />
        </div>
        
        <h3 className="text-xl font-bold mb-2">Drag & Drop files here</h3>
        <p className="text-gray-400 mb-6 text-sm">
          Support for images (JPG, PNG) and video (MP4, MOV)
        </p>
        
        <div className="flex gap-4">
          <button 
            type="button" 
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
          >
            Browse Files
          </button>
        </div>
      </div>
    </motion.div>
  );
}
