import { Video, Globe, Mail, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-white/5 bg-[#050816] pt-20 pb-10 px-6 lg:px-8 xl:px-16 relative z-10 text-white font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <Video className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-wide text-white">WabiSeminar</span>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6 max-w-xs">
              The modern platform for hosting engaging masterclasses, secure meetings, and instant webinars without limits.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <Mail size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6 tracking-wide">Product</h4>
            <ul className="space-y-4 text-sm text-[#94A3B8]">
              <li><button onClick={() => onNavigate('features')} className="hover:text-indigo-400 transition-colors">Features</button></li>
              <li><button onClick={() => onNavigate('how-it-works')} className="hover:text-indigo-400 transition-colors">How it Works</button></li>
              <li><button onClick={() => onNavigate('pricing')} className="hover:text-indigo-400 transition-colors">Pricing</button></li>
              <li><button className="hover:text-indigo-400 transition-colors">Integrations</button></li>
              <li><button className="hover:text-indigo-400 transition-colors">Changelog</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6 tracking-wide">Resources</h4>
            <ul className="space-y-4 text-sm text-[#94A3B8]">
              <li><button className="hover:text-indigo-400 transition-colors">Documentation</button></li>
              <li><button className="hover:text-indigo-400 transition-colors">API Reference</button></li>
              <li><button className="hover:text-indigo-400 transition-colors">Community</button></li>
              <li><button className="hover:text-indigo-400 transition-colors">Blog</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-indigo-400 transition-colors">Help Center</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-6 tracking-wide">Company</h4>
            <ul className="space-y-4 text-sm text-[#94A3B8]">
              <li><button className="hover:text-indigo-400 transition-colors">About</button></li>
              <li><button className="hover:text-indigo-400 transition-colors">Careers</button></li>
              <li><button className="hover:text-indigo-400 transition-colors">Legal</button></li>
              <li><button className="hover:text-indigo-400 transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-indigo-400 transition-colors">Terms of Service</button></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-[#94A3B8]">
          <p>&copy; {new Date().getFullYear()} WabiSeminar Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
