import { Video, Globe, MessageSquare, Mail } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const navigateTo = (id, path) => {
    onNavigate(id);
    window.history.pushState({}, '', path);
    window.scrollTo(0,0);
  };

  return (
    <footer className="border-t border-white/10 bg-[#02040A] pt-20 pb-10 px-6 lg:px-8 xl:px-16 relative z-20">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6 cursor-pointer" onClick={() => navigateTo('dashboard', '/')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Video className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-wide text-white">WabiSeminar</span>
            </div>
            <p className="text-[#94A3B8] leading-relaxed max-w-sm mb-8">
              The next-generation platform for hosting incredibly engaging masterclasses, seminars, and collaborative sessions.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <MessageSquare size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Product Col */}
          <div>
            <h4 className="font-bold text-white mb-6">Product</h4>
            <ul className="space-y-4">
              <li><button onClick={() => navigateTo('features', '/features')} className="text-sm text-[#94A3B8] hover:text-indigo-400 transition-colors">Features</button></li>
              <li><button onClick={() => navigateTo('how-it-works', '/how-it-works')} className="text-sm text-[#94A3B8] hover:text-indigo-400 transition-colors">How It Works</button></li>
              <li><button onClick={() => navigateTo('pricing', '/pricing')} className="text-sm text-[#94A3B8] hover:text-indigo-400 transition-colors">Pricing</button></li>
              <li><button onClick={() => navigateTo('faq', '/faq')} className="text-sm text-[#94A3B8] hover:text-indigo-400 transition-colors">FAQ</button></li>
            </ul>
          </div>

          {/* Resources Col */}
          <div>
            <h4 className="font-bold text-white mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-[#94A3B8] hover:text-indigo-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-sm text-[#94A3B8] hover:text-indigo-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="text-sm text-[#94A3B8] hover:text-indigo-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-[#94A3B8] hover:text-indigo-400 transition-colors">Community</a></li>
            </ul>
          </div>

          {/* Legal Col */}
          <div>
            <h4 className="font-bold text-white mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-[#94A3B8] hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-[#94A3B8] hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-[#94A3B8] hover:text-indigo-400 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-[#54657E]">
          <p>© 2026 WabiSeminar Inc. All rights reserved.</p>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
