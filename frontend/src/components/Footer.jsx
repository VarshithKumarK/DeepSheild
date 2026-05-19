import { FiShield, FiGithub, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0b0f19] mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center flex-col md:flex-row gap-6">
          <div className="flex items-center gap-2">
            <FiShield className="w-6 h-6 text-indigo-400" />
            <span className="font-bold text-xl">DeepShield</span>
          </div>
          
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} DeepShield. All rights reserved.
          </p>

          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <FiTwitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">GitHub</span>
              <FiGithub className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
