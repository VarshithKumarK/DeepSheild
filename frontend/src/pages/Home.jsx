import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';
import { Link } from 'react-router-dom';
import { FiImage, FiVideo, FiSearch, FiMap, FiFileText, FiLayers, FiUploadCloud, FiCpu, FiDownload, FiMonitor, FiCamera, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Home() {
  const features = [
    { icon: FiImage, title: 'Image Detection', description: 'Analyze high-resolution images to detect AI-generated artifacts, blending anomalies, and digital tampering with pinpoint accuracy.', delay: 0.1 },
    { icon: FiVideo, title: 'Video Analysis', description: 'Process videos frame-by-frame using spatial and temporal analysis to catch subtle facial manipulation and deepfakes.', delay: 0.2 },
    { icon: FiMonitor, title: 'Live Screen Monitoring', description: 'Run passive real-time deepfake detection on meeting streams (Meet, Zoom, Teams) with context-aware liveness checks.', delay: 0.3 },
    { icon: FiCamera, title: 'Webcam Biometric KYC', description: 'Verify user presence via guided active challenge sequences (eye blink reflexes and directional head turns).', delay: 0.4 },
    { icon: FiSearch, title: 'Explainable AI', description: 'Understand the "why" behind the results. Our models provide human-readable reasoning and metric breakdowns.', delay: 0.5 },
    { icon: FiMap, title: 'Heatmap Visualization', description: 'Visually identify exactly which areas of a face or image have been modified using our dynamic heatmap overlays.', delay: 0.6 },
    { icon: FiFileText, title: 'PDF Reports', description: 'Generate professional, comprehensive PDF reports for investigations, containing all metrics, heatmaps, and analysis.', delay: 0.7 },
    { icon: FiLayers, title: 'Batch Processing', description: 'Upload multiple files simultaneously and let our system process them asynchronously for maximum efficiency.', delay: 0.8 },
  ];

  return (
    <div className="flex flex-col w-full">
      <Hero />
      
      {/* Live Verification Suite Highlight */}
      <section className="py-24 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider px-3 py-1 bg-indigo-500/10 border border-indigo-500/25 rounded-full">New Live Protection Suite</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">Real-Time Biometric Safeguards</h2>
            <p className="text-gray-400 text-lg">
              Protect your business and meetings against live face swaps and presentation spoofer attacks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Live Card 1: Webcam Verification */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.01 }}
              className="glass-panel p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/10 to-transparent flex flex-col justify-between h-[340px]"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 mb-6">
                  <FiCamera className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Webcam Biometric KYC</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Interactive multi-step challenge verification (eye-blinks, left/right head yaw turns) verifying physical human presence and preventing static photo presentation attacks.
                </p>
              </div>
              <Link to="/live-verification" className="text-indigo-400 hover:text-indigo-300 font-bold text-sm inline-flex items-center gap-1.5 transition-colors self-start mt-4">
                Launch Webcam KYC <FiArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Live Card 2: Screen Monitor */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.01 }}
              className="glass-panel p-8 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-transparent flex flex-col justify-between h-[340px]"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-6">
                  <FiMonitor className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Passive Screen Monitor</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Continuous real-time deepfake check on desktop shared windows, browser tabs, or meeting streams (Google Meet, Zoom, Teams, Webex). Auto-detects meeting app labels to run context-aware anti-spoof checks.
                </p>
              </div>
              <Link to="/screen-monitor" className="text-purple-400 hover:text-purple-300 font-bold text-sm inline-flex items-center gap-1.5 transition-colors self-start mt-4">
                Launch Screen Monitor <FiArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 bg-white/[0.01] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Detection</h2>
            <p className="text-gray-400 text-lg">
              Everything you need to verify digital media authenticity in one powerful platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to secure your digital assets.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-8">
            <div className="flex-1 flex flex-col items-center text-center max-w-sm">
              <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative">
                <FiUploadCloud className="w-10 h-10 text-indigo-400" />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold border-4 border-[#0b0f19]">1</div>
              </div>
              <h3 className="text-xl font-bold mb-2">Upload Media</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Securely drop your images or videos into our encrypted upload zone.</p>
            </div>

            <div className="hidden md:block w-12 h-0.5 bg-gradient-to-r from-indigo-500/50 to-purple-500/50"></div>

            <div className="flex-1 flex flex-col items-center text-center max-w-sm">
              <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative">
                <FiCpu className="w-10 h-10 text-purple-400" />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold border-4 border-[#0b0f19]">2</div>
              </div>
              <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Our multi-modal models analyze artifacts, metadata, and spatial anomalies.</p>
            </div>

            <div className="hidden md:block w-12 h-0.5 bg-gradient-to-r from-purple-500/50 to-blue-500/50"></div>

            <div className="flex-1 flex flex-col items-center text-center max-w-sm">
              <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative">
                <FiDownload className="w-10 h-10 text-blue-400" />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold border-4 border-[#0b0f19]">3</div>
              </div>
              <h3 className="text-xl font-bold mb-2">Download Report</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Get instant results with detailed explanations and verifiable PDF reports.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
