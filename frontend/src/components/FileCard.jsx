import { FiImage, FiVideo, FiX, FiCheckCircle, FiLoader } from 'react-icons/fi';

export default function FileCard({ file, onRemove }) {
  // Use file.type directly, which is robust for actual File objects
  const isVideo = file.type?.startsWith('video');
  const Icon = isVideo ? FiVideo : FiImage;

  // Render a tiny preview if it's available and not a placeholder
  const renderPreview = () => {
    if (file.preview) {
      if (isVideo) {
        return (
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0">
            <video src={file.preview} className="w-full h-full object-cover" />
          </div>
        );
      }
      return (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0">
          <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
        </div>
      );
    }
    
    // Fallback icon
    return (
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isVideo ? 'bg-purple-500/10' : 'bg-blue-500/10'}`}>
        <Icon className={`w-6 h-6 ${isVideo ? 'text-purple-400' : 'text-blue-400'}`} />
      </div>
    );
  };

  // Convert bytes to MB/KB if size is a number
  const formatSize = (size) => {
    if (typeof size === 'string') return size; // For dummy data
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="glass-panel p-4 rounded-xl flex items-center gap-4 hover:bg-white/[0.02] transition-colors group border-white/5">
      {renderPreview()}
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-200 truncate">{file.name}</h4>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-500">{formatSize(file.size)}</span>
          <span className="flex items-center gap-1 text-xs">
            {file.status === 'processing' ? (
              <span className="text-yellow-400 flex items-center gap-1">
                <FiLoader className="animate-spin w-3 h-3" /> Processing...
              </span>
            ) : file.status === 'completed' ? (
              <span className="text-green-400 flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" /> Ready
              </span>
            ) : file.status === 'error' ? (
              <span className="text-red-400 flex items-center gap-1">
                <FiX className="w-3 h-3" /> Error
              </span>
            ) : (
              <span className="text-gray-400">Pending</span>
            )}
          </span>
        </div>
      </div>

      <button 
        onClick={() => onRemove(file.id)}
        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
      >
        <FiX className="w-5 h-5" />
      </button>
    </div>
  );
}
