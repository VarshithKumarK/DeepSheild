import { motion } from 'framer-motion';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiFileText } from 'react-icons/fi';

export default function ProfileStats({ stats }) {
  const statCards = [
    { label: 'Total Scans', value: stats.totalScans, icon: <FiShield />, bgGradient: 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40', border: 'border-blue-500/30', iconColor: 'text-blue-400 text-shadow-blue' },
    { label: 'Fake Detections', value: stats.fakeDetections, icon: <FiAlertTriangle />, bgGradient: 'bg-gradient-to-br from-red-900/40 to-orange-900/40', border: 'border-red-500/30', iconColor: 'text-red-400 text-shadow-red' },
    { label: 'Real Detections', value: stats.realDetections, icon: <FiCheckCircle />, bgGradient: 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40', border: 'border-emerald-500/30', iconColor: 'text-emerald-400 text-shadow-emerald' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
      {statCards.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className={`p-6 rounded-2xl relative overflow-hidden group border ${stat.border} ${stat.bgGradient} backdrop-blur-md shadow-lg`}
        >
          {/* Subtle background glow effect on hover */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.iconColor}`}>
              <div className="w-6 h-6 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
                {stat.icon}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-3xl font-bold text-white mb-1">{stat.value}</h4>
            <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
