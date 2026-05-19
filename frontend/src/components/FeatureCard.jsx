import { motion } from 'framer-motion';

export default function FeatureCard({ icon: Icon, title, description, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-panel p-6 rounded-2xl hover-card-effect group cursor-pointer"
    >
      <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors border border-indigo-500/20">
        <Icon className="w-7 h-7 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-indigo-200 transition-colors">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  );
}
