import { FiActivity } from 'react-icons/fi';
import ActivityCard from './ActivityCard';

export default function RecentScans({ scans }) {
  return (
    <div className="rounded-2xl p-6 h-full border border-indigo-500/20 bg-gradient-to-br from-gray-900/80 to-blue-900/10 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FiActivity className="text-indigo-400" />
          Recent Scans
        </h3>
        <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {scans.length > 0 ? (
          scans.map((scan) => (
            <ActivityCard key={scan.id} scan={scan} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No recent scans found.
          </div>
        )}
      </div>
    </div>
  );
}
