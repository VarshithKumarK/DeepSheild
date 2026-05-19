import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';
import { FiImage, FiVideo, FiSearch, FiMap, FiFileText, FiLayers, FiUploadCloud, FiCpu, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Home() {
  const features = [
    { icon: FiImage, title: 'Image Detection', description: 'Analyze high-resolution images to detect AI-generated artifacts, blending anomalies, and digital tampering with pinpoint accuracy.', delay: 0.1 },
    { icon: FiVideo, title: 'Video Analysis', description: 'Process videos frame-by-frame using spatial and temporal analysis to catch subtle facial manipulation and deepfakes.', delay: 0.2 },
    { icon: FiSearch, title: 'Explainable AI', description: 'Understand the "why" behind the results. Our models provide human-readable reasoning and metric breakdowns.', delay: 0.3 },
    { icon: FiMap, title: 'Heatmap Visualization', description: 'Visually identify exactly which areas of a face or image have been modified using our dynamic heatmap overlays.', delay: 0.4 },
    { icon: FiFileText, title: 'PDF Reports', description: 'Generate professional, comprehensive PDF reports for investigations, containing all metrics, heatmaps, and analysis.', delay: 0.5 },
    { icon: FiLayers, title: 'Batch Processing', description: 'Upload multiple files simultaneously and let our system process them asynchronously for maximum efficiency.', delay: 0.6 },
  ];

  return (
    <div className="flex flex-col w-full">
      <Hero />
      
      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Detection</h2>
            <p className="text-gray-400 text-lg">
              Everything you need to verify digital media authenticity in one powerful platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
