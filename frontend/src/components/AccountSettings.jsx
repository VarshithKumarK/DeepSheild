import { motion } from 'framer-motion';
import { FiSettings, FiLock, FiLogOut, FiCheck, FiLoader } from 'react-icons/fi';
import { useState } from 'react';
import api from '../services/api';

export default function AccountSettings({ user, onLogout, onUpdate }) {
  const [name, setName] = useState(user.name);
  
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passUpdating, setPassUpdating] = useState(false);
  const [passMessage, setPassMessage] = useState('');

  const handleUpdateProfile = async (overrides = {}) => {
    setUpdating(true);
    setMessage('');
    try {
      const res = await api.put('/api/profile', {
        name: overrides.name !== undefined ? overrides.name : name
      });
      if (res.data.success) {
        onUpdate(res.data.data);
        if (!overrides.silent) {
          setMessage('Profile updated successfully!');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassUpdating(true);
    setPassMessage('');
    try {
      const res = await api.put('/api/profile/change-password', {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        setPassMessage('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => {
          setPassMessage('');
          setShowPasswordChange(false);
        }, 2000);
      }
    } catch (err) {
      setPassMessage(err.response?.data?.message || 'Password update failed.');
    } finally {
      setPassUpdating(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 h-full border border-indigo-500/20 bg-gradient-to-br from-gray-900/80 to-indigo-900/10 backdrop-blur-xl shadow-xl flex flex-col">
      <div className="flex items-center justify-between mb-6 text-white">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FiSettings className="text-gray-400" />
          Account Settings
        </h3>
        {updating && <FiLoader className="w-4 h-4 text-indigo-400 animate-spin" />}
      </div>

      <div className="space-y-6 flex-1">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleUpdateProfile()}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Email Address</label>
            <input 
              type="email" 
              value={user.email} 
              disabled
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
          
          {message && <p className="text-xs text-emerald-400 flex items-center gap-1"><FiCheck /> {message}</p>}

          {!showPasswordChange ? (
            <button 
              onClick={() => setShowPasswordChange(true)}
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mt-2 transition-colors"
            >
              <FiLock className="w-4 h-4" /> Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3 mt-4">
              <input 
                type="password" 
                placeholder="Current Password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <input 
                type="password" 
                placeholder="New Password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              {passMessage && (
                <p className={`text-xs ${passMessage.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {passMessage}
                </p>
              )}
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordChange(false)}
                  className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={passUpdating}
                  className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {passUpdating ? 'Updating...' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <motion.button
          onClick={onLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600/80 to-red-500/80 hover:from-red-500 hover:to-red-400 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20"
        >
          <FiLogOut className="w-5 h-5" />
          Sign Out
        </motion.button>
      </div>
    </div>
  );
}
