import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiCamera, FiLoader } from 'react-icons/fi';
import api from '../services/api';

export default function ProfileHeader({ user, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const res = await api.post('/api/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success && onUpdate) {
        onUpdate(res.data.data);
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden glass-panel border border-indigo-500/20 bg-gradient-to-r from-gray-900/80 to-blue-900/10 backdrop-blur-xl shadow-xl mb-6 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Avatar & Info */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Avatar Container */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        <motion.div 
          whileHover={{ scale: 1.05 }}
          onClick={triggerUpload}
          className="relative group cursor-pointer shrink-0"
        >
          <div className="w-24 h-24 rounded-full bg-gray-900 border-2 border-indigo-500/50 shadow-lg overflow-hidden flex items-center justify-center relative z-10">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-indigo-400">{user.name?.charAt(0)}</span>
            )}
            {/* Overlay for hover */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <FiLoader className="w-6 h-6 text-white animate-spin" />
              ) : (
                <FiCamera className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
          {/* Active Status Dot */}
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-gray-900 rounded-full z-20 shadow-sm"></div>
        </motion.div>

        {/* User Details */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-white tracking-tight">{user.name}</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">{user.email}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-col items-center md:items-end gap-3">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 text-xs font-semibold tracking-wide uppercase">DeepShield Active</span>
        </motion.div>
        
        <div className="text-gray-500 text-xs font-medium">
          Joined {user.joined}
        </div>
      </div>
    </div>
  );
}
