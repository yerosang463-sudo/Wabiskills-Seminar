import { useState, useEffect } from 'react';
import { Video, Menu, X, Moon } from 'lucide-react';

export default function Navbar({ currentView, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    setIsAuthenticated(Boolean(token && username));

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setIsAuthenticated(false);
      window.location.reload(); // Refresh to clean state
    } else {
      onNavigate('auth');
      window.history.pushState({}, '', '/');
    }
  };

  const navLinks = [
    { id: 'dashboard', label: 'Home', path: '/' },
    { id: 'features', label: 'Features', path: '/features' },
    { id: 'how-it-works', label: 'How It Works', path: '/how-it-works' },
    { id: 'pricing', label: 'Pricing', path: '/pricing' },
    { id: 'faq', label: 'FAQ', path: '/faq' }
  ];

  const navigateTo = (id, path) => {
    setIsMenuOpen(false);
    onNavigate(id);
    window.history.pushState({}, '', path);
  };

  return (
    <header className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
      isScrolled ? 'h-16 lg:h-20 bg-[#050816]/90 backdrop-blur-md border-b border-white/10 shadow-lg' : 'h-20 lg:h-24 bg-transparent border-transparent'
    }`}>
      <div className="h-full px-6 lg:px-8 xl:px-16 flex items-center justify-between max-w-[1600px] mx-auto">
        
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('dashboard', '/')}>
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Video className="text-white w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <span className="font-bold text-lg lg:text-xl tracking-wide text-white">
            WabiSeminar
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-1 p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => navigateTo(link.id, link.path)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                currentView === link.id
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors hover:bg-white/5">
            <Moon size={18} />
          </button>
          <button 
            className="flex items-center space-x-2 text-sm font-bold text-white bg-white/10 border border-white/10 px-6 py-2.5 rounded-full hover:bg-white/20 hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            onClick={handleAuthAction}
          >
            {isAuthenticated ? 'Sign Out' : 'Sign In'}
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-[#94A3B8] hover:text-white transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[64px] z-40 bg-[#050816]/95 backdrop-blur-xl px-6 py-8 flex flex-col lg:hidden border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col space-y-2 flex-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => navigateTo(link.id, link.path)}
                className={`text-left px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                  currentView === link.id
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col space-y-4">
            <button 
              className="w-full text-center text-lg font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 rounded-xl shadow-lg"
              onClick={handleAuthAction}
            >
              {isAuthenticated ? 'Sign Out' : 'Sign In'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
