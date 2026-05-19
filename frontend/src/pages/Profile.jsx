import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import ProfileHeader from '../components/ProfileHeader';
import ProfileStats from '../components/ProfileStats';
import RecentScans from '../components/RecentScans';
import AccountSettings from '../components/AccountSettings';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiLoader } from 'react-icons/fi';

export default function Profile() {
  const { logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    totalScans: 0,
    fakeDetections: 0,
    realDetections: 0,
    reportsGenerated: 0
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, statsRes, historyRes] = await Promise.all([
          api.get('/api/profile'),
          api.get('/api/profile/stats'),
          api.get('/api/profile/history')
        ]);

        if (profileRes.data.success) setProfileData(profileRes.data.data);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (historyRes.data.success) setHistory(historyRes.data.data);
        
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <FiLoader className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!profileData) {
    return <div className="text-center text-gray-400 mt-20">Failed to load profile data.</div>;
  }

  // Formatting for components
  const displayStats = {
    totalScans: stats.totalScans.toLocaleString(),
    fakeDetections: stats.fakeDetections.toLocaleString(),
    realDetections: stats.realDetections.toLocaleString(),
    reports: stats.reportsGenerated.toLocaleString()
  };

  const displayScans = history.map(h => ({
    id: h._id,
    fileName: h.fileName,
    type: h.fileType,
    result: h.label,
    confidence: h.confidence.toFixed(1),
    date: new Date(h.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    summary: h.summary
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <ProfileHeader user={profileData} onUpdate={(updated) => setProfileData(updated)} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ProfileStats stats={displayStats} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <RecentScans scans={displayScans} />
          </motion.div>
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <AccountSettings user={profileData} onLogout={logout} onUpdate={(updated) => setProfileData(updated)} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
