import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Moon, LogOut, LogIn, Menu, X, User, Settings, ChevronDown } from 'lucide-react';

export default function Header({ currentView, onNavigate, isAuthenticated, handleAuthAction }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'dashboard', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQ' },
  ];

  const handleNavClick = (id) => {
    setIsMenuOpen(false);
    onNavigate(id);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <motion.header 
        className={`fixed top-0 w-full flex items-center justify-between px-6 lg:px-8 xl:px-16 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'h-20 lg:h-24 bg-[#050816]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' 
            : 'h-24 lg:h-28 bg-transparent border-b-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Video className="text-white w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <span className="font-bold text-lg lg:text-xl tracking-wide text-white">
            WabiSeminar
          </span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = currentView === link.id || (currentView === 'user-dashboard' && link.id === 'dashboard');
            return (
              <button 
                key={link.id}
                onClick={() => handleNavClick(link.id)} 
                className={`text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-purple-300 bg-purple-600/20 px-6 py-2 rounded-full border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.15)]' 
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          <button className="hidden lg:flex w-10 h-10 rounded-full border border-white/10 items-center justify-center text-[#94A3B8] hover:text-white transition-colors hover:bg-white/5">
            <Moon size={18} />
          </button>
          {isAuthenticated ? (
            <div className="relative">
              <button 
                className="flex items-center space-x-2 text-sm font-semibold text-white bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 lg:py-2.5 rounded-full hover:bg-indigo-500/20 transition-all"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold shadow-lg">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{username}</span>
                <ChevronDown size={14} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-3 w-48 bg-[#0A0F24] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/5 mb-1">
                      <p className="text-xs text-[#94A3B8]">Signed in as</p>
                      <p className="text-sm font-bold text-white truncate">{username}</p>
                    </div>
                    <button 
                      className="w-full px-4 py-2 text-sm text-left text-[#94A3B8] hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                      onClick={() => { setIsProfileOpen(false); handleNavClick('profile'); }}
                    >
                      <User size={16} /> Profile
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-sm text-left text-[#94A3B8] hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                      onClick={() => { setIsProfileOpen(false); handleNavClick('settings'); }}
                    >
                      <Settings size={16} /> Settings
                    </button>
                    <div className="h-px bg-white/5 my-1 w-full"></div>
                    <button 
                      className="w-full px-4 py-2 text-sm text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                      onClick={() => { setIsProfileOpen(false); handleAuthAction(); }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          ) : (
            <button 
              className="flex items-center space-x-2 text-sm font-semibold text-white bg-white/10 border border-white/10 px-5 py-2 lg:py-2.5 rounded-full hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
              onClick={() => { setIsMenuOpen(false); handleAuthAction(); }}
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-[#94A3B8] hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#050816]/95 backdrop-blur-xl pt-24 px-6 pb-6 flex flex-col space-y-6 lg:hidden border-b border-white/10">
          {navLinks.map((link) => {
            const isActive = currentView === link.id || (currentView === 'user-dashboard' && link.id === 'dashboard');
            return (
              <button 
                key={link.id}
                onClick={() => handleNavClick(link.id)} 
                className={`text-left text-lg font-medium ${isActive ? 'text-purple-400 font-semibold' : 'text-[#94A3B8] hover:text-white'}`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
