import { Link } from 'react-router-dom';
import { FiShield, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full top-4 z-50 px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto backdrop-blur-md bg-white/[0.02] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
              <FiShield className="w-8 h-8 text-indigo-400" />
            </div>
            <span className="font-bold text-2xl tracking-tight">
              Deep<span className="text-gradient">Shield</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Home</Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Dashboard</Link>
                  <Link to="/live-verification" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Live Verification</Link>
                  <Link to="/screen-monitor" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Screen Monitor</Link>
                  <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                    <Link to="/profile" className="flex items-center gap-2 group cursor-pointer hover:bg-white/5 pr-3 pl-1 py-1 rounded-full transition-colors">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                        <span className="text-indigo-400 font-medium text-sm group-hover:text-indigo-300">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{user.name?.split(' ')[0]}</span>
                    </Link>
                    <button 
                      onClick={logout}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Sign out"
                    >
                      <FiLogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                  <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                    Sign in
                  </Link>
                  <Link to="/register" className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-400 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isOpen && (
          <div className="md:hidden border-t border-white/10 px-4 pt-4 pb-6 bg-[#0b0f19]/95 backdrop-blur-lg rounded-b-2xl flex flex-col gap-2">
            <Link to="/" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-colors text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/5">Home</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-colors text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/5">Dashboard</Link>
                <Link to="/live-verification" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-colors text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/5">Live Verification</Link>
                <Link to="/screen-monitor" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-colors text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/5">Screen Monitor</Link>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/5 border-t border-white/5 mt-2 pt-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <span className="text-indigo-400 font-medium text-sm">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                  </div>
                  <span>Profile ({user.name})</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-colors text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/5 w-full text-left"
                >
                  <FiLogOut className="w-5 h-5" /> Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 border-t border-white/5 mt-2 pt-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-colors text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/5">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="px-5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all text-center shadow-lg shadow-indigo-500/20">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
