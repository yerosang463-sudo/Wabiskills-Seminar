import { useRef, useState, useEffect } from 'react';
import api from '../services/api.js';
import { roomIdFromPathname } from '../routeUtils.js';
import { 
  Video, LogOut, LogIn, Plus, Users, X, Loader2, 
  Sparkles, Zap, Shield, Clock, Monitor, Moon, ChevronRight, Link,
  CheckCircle, Star, MessageSquare, Menu
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Dashboard({ onNavigate, onJoinRoom, notify }) {
  const [joinId, setJoinId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [actionError, setActionError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const createInFlightRef = useRef(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
    // Smooth scroll behavior for the entire page
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const showError = (message) => {
    setActionError(message);
    notify?.('error', message);
  };

  const extractRoomId = (value) => {
    const raw = value.trim();
    if (!raw) return '';

    try {
      const url = raw.startsWith('http') ? new URL(raw) : null;
      if (url) {
        return roomIdFromPathname(url.pathname) || '';
      }
    } catch {
      // Fall back to plain text parsing below.
    }

    if (raw.includes('/')) {
      const path = raw.startsWith('/') ? raw : `/${raw}`;
      const fromPath = roomIdFromPathname(path);
      if (fromPath) return fromPath;
    }

    return raw.split('?')[0].replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  };

  const handleCreateRoom = async () => {
    if (createInFlightRef.current) return;

    createInFlightRef.current = true;
    setIsCreating(true);
    setActionError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onNavigate('auth');
        return;
      }

      const response = await api.createRoom(token);
      
      if (response.status === 401) {
        showError('Your session expired. Please log in again.');
        localStorage.clear();
        onNavigate('auth');
        return;
      }
      
      if (!response.success || !response.data?.roomId) {
        showError(response.message || 'Failed to create room on server.');
        return;
      }

      notify?.('success', 'Meeting created. Opening the room...');
      onJoinRoom(response.data.roomId);
    } catch (error) {
      console.error('Error creating room:', error);
      showError('Network error. Please try again.');
    } finally {
      setIsCreating(false);
      createInFlightRef.current = false;
    }
  };

  const handleJoinRoom = async () => {
    setActionError('');
    const id = extractRoomId(joinId);
    if (!id || isJoining) return;

    setIsJoining(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onNavigate('auth');
        return;
      }

      const response = await api.getRoom(token, id);
      if (!response.success) {
        showError(response.status === 404 ? 'Room not found. Please check the meeting link/ID.' : response.message || 'Unable to join this room.');
        return;
      }

      notify?.('success', 'Meeting found. Asking the host to let you in...');
      onJoinRoom(id);
    } catch (error) {
      console.error('Error joining room:', error);
      showError('Network error. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setIsAuthenticated(false);
      notify?.('success', 'Logged out successfully');
    } else {
      onNavigate('auth');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050816] relative text-white font-sans overflow-x-hidden">
      
      {/* Background Animated Blobs */}
      <div className="fixed bg-purple-600/15 blur-[120px] w-[600px] h-[600px] rounded-full top-[-10%] left-[-10%] pointer-events-none"></div>
      <div className="fixed bg-blue-600/10 blur-[120px] w-[500px] h-[500px] rounded-full bottom-[10%] right-[-10%] pointer-events-none"></div>

      {/* Sticky Top Navbar */}
      <header className="fixed top-0 w-full h-20 lg:h-24 flex items-center justify-between px-6 lg:px-8 xl:px-16 z-50 bg-[#050816]/80 backdrop-blur-md border-b border-white/5 transition-all">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Video className="text-white w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <span className="font-bold text-lg lg:text-xl tracking-wide text-white">
            WabiSeminar
          </span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          <a href="#" className="text-sm font-semibold text-purple-300 bg-purple-600/20 px-6 py-2 rounded-full border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.15)] transition-all">
            Home
          </a>
          <button onClick={() => {
            onNavigate('features');
            window.history.pushState({}, '', '/features');
          }} className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">
            Features
          </button>
          <button onClick={() => {
            onNavigate('how-it-works');
            window.history.pushState({}, '', '/how-it-works');
          }} className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">
            How It Works
          </button>
          <a href="#testimonials" className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">
            Testimonials
          </a>
          <a href="#faq" className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          <button className="hidden lg:flex w-10 h-10 rounded-full border border-white/10 items-center justify-center text-[#94A3B8] hover:text-white transition-colors hover:bg-white/5">
            <Moon size={18} />
          </button>
          <button 
            className="flex items-center space-x-2 text-sm font-semibold text-white bg-white/10 border border-white/10 px-5 py-2 lg:py-2.5 rounded-full hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            onClick={handleAuthAction}
          >
            {isAuthenticated ? (
              <>
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span className="hidden sm:inline">Sign In</span>
              </>
            )}
          </button>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-[#94A3B8] hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#050816]/95 backdrop-blur-xl pt-24 px-6 pb-6 flex flex-col space-y-6 lg:hidden border-b border-white/10">
          <a href="#" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-purple-400">Home</a>
          <button onClick={() => {
            setIsMenuOpen(false);
            onNavigate('features');
            window.history.pushState({}, '', '/features');
          }} className="text-lg font-medium text-[#94A3B8] hover:text-white text-left">Features</button>
          <button onClick={() => {
            setIsMenuOpen(false);
            onNavigate('how-it-works');
            window.history.pushState({}, '', '/how-it-works');
          }} className="text-lg font-medium text-[#94A3B8] hover:text-white text-left">How It Works</button>
          <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-[#94A3B8] hover:text-white">Testimonials</a>
          <a href="#faq" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-[#94A3B8] hover:text-white">FAQ</a>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-32 lg:pt-40 relative z-10">
        
        {/* HERO SECTION */}
        <section className="px-6 lg:px-8 xl:px-16 pb-20 lg:pb-32">
          <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            
            {actionError && (
              <div className="lg:col-span-2 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm flex items-center shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                <Shield className="mr-3 text-rose-400" size={18} />
                {actionError}
              </div>
            )}

            {/* Left Column - Hero Info */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col justify-center space-y-8 lg:space-y-10"
            >
              {/* Free Pill */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-transparent text-purple-300 w-fit text-xs sm:text-sm font-semibold shadow-[0_0_15px_rgba(147,51,234,0.15)]">
                <Sparkles size={16} className="text-purple-400" />
                <span>100% Free Forever Platform</span>
              </div>

              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white">
                Host Engaging <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 drop-shadow-lg">
                  Masterclasses
                </span><br/>
                Without Limits
              </h1>
              
              {/* Subtext */}
              <p className="text-[#94A3B8] text-lg sm:text-xl max-w-[550px] leading-relaxed font-light">
                Create a free meeting room instantly or join an existing session in seconds. Built for innovative educators, creators, and teams who value simplicity and connection.
              </p>

              {/* Features Row (Hero) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2 max-w-[550px]">
                <div className="flex flex-col space-y-3 group">
                  <div className="w-12 h-12 rounded-xl bg-[#1E113C] flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/50 transition-all shadow-[0_0_15px_rgba(147,51,234,0.1)]">
                    <Zap size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">Instant Setup</h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">Join in one click</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-3 group">
                  <div className="w-12 h-12 rounded-xl bg-[#0A241A] flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/50 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <Users size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">No Limits</h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">Host endlessly</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-3 group hidden sm:flex">
                  <div className="w-12 h-12 rounded-xl bg-[#331C0D] flex items-center justify-center border border-orange-500/20 group-hover:border-orange-500/50 transition-all shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                    <Shield size={20} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">Ultra Secure</h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">End-to-end safe</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap sm:flex-nowrap gap-4 pt-4 max-w-[550px]">
                <div className="flex-1 min-w-[140px] bg-[#0A0F24]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:bg-[#0A0F24]/80 transition-all shadow-lg">
                  <Users size={20} className="text-indigo-400 mb-2" />
                  <div className="text-3xl font-extrabold text-white mb-1">10K+</div>
                  <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Happy Users</div>
                </div>
                <div className="flex-1 min-w-[140px] bg-[#0A0F24]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:bg-[#0A0F24]/80 transition-all shadow-lg">
                  <Video size={20} className="text-emerald-400 mb-2" />
                  <div className="text-3xl font-extrabold text-white mb-1">50K+</div>
                  <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Meetings Hosted</div>
                </div>
                <div className="flex-1 min-w-[140px] bg-[#0A0F24]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:bg-[#0A0F24]/80 transition-all shadow-lg hidden sm:block">
                  <Clock size={20} className="text-purple-400 mb-2" />
                  <div className="text-3xl font-extrabold text-white mb-1">1M+</div>
                  <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Minutes Shared</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Main Interaction Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
              className="relative lg:ml-auto w-full max-w-[540px] perspective-[1000px]"
            >
              {/* The Main Glowing Card */}
              <div className="bg-[#0A0F24]/90 backdrop-blur-3xl border border-purple-500/40 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_100px_-20px_rgba(124,58,237,0.4)] relative overflow-hidden group">
                
                {/* Internal card glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                {/* Floating + Icon */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#050816] border border-purple-500/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.8)] z-20 hover:rotate-90 transition-transform duration-500">
                  <Plus size={24} className="text-indigo-300" />
                </div>

                {/* Start Meeting Section */}
                <div className="mb-10 relative z-10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-indigo-500/20 p-2 rounded-xl">
                      <Video className="text-indigo-400" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Start a New Meeting</h2>
                  </div>
                  <p className="text-sm text-[#94A3B8] mb-6">Create a secure room instantly and invite others to join.</p>
                  
                  <button 
                    type="button"
                    className={`w-full py-4 px-6 rounded-2xl text-[16px] font-bold text-white flex items-center justify-between transition-all duration-300 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:from-indigo-400 hover:via-purple-400 hover:to-blue-400 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.7)] ${isCreating ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(99,102,241,0.8)]'}`}
                    onClick={handleCreateRoom}
                    disabled={isCreating}
                  >
                    <div className="flex items-center">
                      {isCreating ? (
                        <Loader2 className="mr-3 animate-spin" size={22} />
                      ) : (
                        <Video className="mr-3" size={22} />
                      )}
                      <span>Create Instant Room</span>
                    </div>
                    <ChevronRight size={22} className="opacity-90" />
                  </button>
                </div>
                
                {/* Divider */}
                <div className="relative flex items-center justify-center mb-10 z-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative bg-[#0A0F24] w-10 h-10 flex items-center justify-center rounded-full text-xs font-bold text-[#94A3B8] border border-white/10 shadow-lg">
                    OR
                  </div>
                </div>

                {/* Join Meeting Section */}
                <div className="mb-8 relative z-10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-emerald-500/20 p-2 rounded-xl">
                      <Users className="text-emerald-400" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Join an Existing Meeting</h2>
                  </div>
                  <p className="text-sm text-[#94A3B8] mb-6">Enter a room ID or link shared by your host.</p>
                  
                  <div className="flex flex-col space-y-4">
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#94A3B8] font-bold">
                        #
                      </div>
                      <input 
                        type="text" 
                        value={joinId}
                        onChange={(e) => setJoinId(e.target.value)}
                        placeholder="Enter Room ID (e.g. abc-defg-hij)" 
                        className="w-full bg-[#050816] border border-white/10 rounded-2xl pl-11 pr-4 py-4.5 text-[15px] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner" 
                        onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                      />
                    </div>
                    <button 
                      type="button"
                      className={`w-full py-4 px-6 rounded-2xl text-[16px] font-bold text-white flex items-center justify-between transition-all duration-300 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] ${!joinId.trim() || isJoining ? 'opacity-90' : 'hover:-translate-y-1 hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.7)]'}`}
                      onClick={handleJoinRoom}
                    >
                      <div className="flex items-center">
                        {isJoining ? (
                          <Loader2 className="mr-3 animate-spin" size={22} />
                        ) : (
                          <Link className="mr-3" size={22} />
                        )}
                        <span>Join Room</span>
                      </div>
                      <ChevronRight size={22} className="opacity-90" />
                    </button>
                  </div>
                </div>

                {/* Bottom Feature Highlights */}
                <div className="flex justify-between border-t border-white/10 pt-6 relative z-10">
                  <div className="flex items-start space-x-3">
                    <Monitor size={18} className="text-emerald-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white mb-0.5">No Downloads</h4>
                      <p className="text-[11px] text-[#94A3B8] leading-relaxed">Web-based, works<br/>on any device</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Sparkles size={18} className="text-indigo-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white mb-0.5">HD Quality</h4>
                      <p className="text-[11px] text-[#94A3B8] leading-relaxed">Crystal clear audio<br/>and video</p>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </section>

        {/* TRUSTED BY STRIP */}
        <section className="border-y border-white/5 bg-white/[0.01] py-12 relative z-10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-slate-400 text-sm font-bold tracking-[0.2em] uppercase mb-8">Trusted by innovative teams worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
              <div className="text-2xl font-black flex items-center gap-3 text-white"><div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50"></div> Acme Corp</div>
              <div className="text-2xl font-black flex items-center gap-3 text-white"><div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/50"></div> Globex</div>
              <div className="text-2xl font-black flex items-center gap-3 text-white"><div className="w-8 h-8 rounded-tl-2xl rounded-br-2xl bg-gradient-to-tr from-rose-500 to-orange-500 shadow-lg shadow-rose-500/50"></div> Stark Ind</div>
              <div className="text-2xl font-black flex items-center gap-3 text-white hidden md:flex"><div className="w-8 h-8 rotate-45 bg-gradient-to-tr from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50"></div> Initech</div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-24 lg:py-32 relative z-10 px-6 lg:px-8 xl:px-16">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white">Everything you need for <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">perfect seminars</span></h2>
              <p className="text-[#94A3B8] text-lg md:text-xl leading-relaxed">WabiSeminar brings together the best tools for video collaboration in one beautiful, frictionless package. Focus on your audience, not the tech.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-[#0A0F24]/60 backdrop-blur-lg border border-white/5 hover:border-indigo-500/30 p-10 rounded-[2rem] hover:-translate-y-2 transition-all duration-500 shadow-xl hover:shadow-[0_20px_50px_-15px_rgba(99,102,241,0.2)] group">
                <div className="w-16 h-16 bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors text-indigo-400 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-indigo-500/20"> 
                  <Video size={32}/> 
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Ultra HD Video</h3>
                <p className="text-[#94A3B8] leading-relaxed text-lg">Experience crystal clear video and audio quality powered by advanced WebRTC architecture, ensuring you always look your best.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#0A0F24]/60 backdrop-blur-lg border border-white/5 hover:border-emerald-500/30 p-10 rounded-[2rem] hover:-translate-y-2 transition-all duration-500 shadow-xl hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.2)] group">
                <div className="w-16 h-16 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors text-emerald-400 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-emerald-500/20"> 
                  <MessageSquare size={32}/> 
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Real-time Chat</h3>
                <p className="text-[#94A3B8] leading-relaxed text-lg">Keep your audience engaged with lightning-fast built-in chat. Share links, answer questions, and foster community instantly.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#0A0F24]/60 backdrop-blur-lg border border-white/5 hover:border-purple-500/30 p-10 rounded-[2rem] hover:-translate-y-2 transition-all duration-500 shadow-xl hover:shadow-[0_20px_50px_-15px_rgba(168,85,247,0.2)] group">
                <div className="w-16 h-16 bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors text-purple-400 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-purple-500/20"> 
                  <Monitor size={32}/> 
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Screen Sharing</h3>
                <p className="text-[#94A3B8] leading-relaxed text-lg">Present your masterclass seamlessly. Share your entire screen, specific windows, or browser tabs with zero lag.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section id="testimonials" className="py-24 lg:py-32 relative z-10 bg-gradient-to-b from-transparent to-[#0A0F24] px-6 lg:px-8 xl:px-16">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white">Loved by educators</h2>
              <p className="text-[#94A3B8] text-lg md:text-xl leading-relaxed">See why thousands of professionals choose WabiSeminar over legacy video conferencing platforms.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-[#160B2A]/40 backdrop-blur-md border border-purple-500/20 p-10 rounded-[2rem] relative">
                <div className="flex gap-1 text-yellow-400 mb-6">
                  <Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" />
                </div>
                <p className="text-white text-lg leading-relaxed mb-8 font-light">"WabiSeminar completely changed how I host my design masterclasses. The UI is gorgeous, and my students love that they don't have to download any software."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center font-bold text-white text-xl shadow-lg">S</div>
                  <div>
                    <h4 className="text-white font-bold">Sarah Jenkins</h4>
                    <p className="text-[#94A3B8] text-sm">Lead Designer, StudioX</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-[#0A241A]/40 backdrop-blur-md border border-emerald-500/20 p-10 rounded-[2rem] relative md:-translate-y-6">
                <div className="flex gap-1 text-yellow-400 mb-6">
                  <Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" />
                </div>
                <p className="text-white text-lg leading-relaxed mb-8 font-light">"The waiting room feature is perfect for managing my 1-on-1 coaching sessions. The video quality has been incredibly stable even on lower bandwidths."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-white text-xl shadow-lg">M</div>
                  <div>
                    <h4 className="text-white font-bold">Marcus Chen</h4>
                    <p className="text-[#94A3B8] text-sm">Executive Coach</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-[#0A0F24]/80 backdrop-blur-md border border-blue-500/20 p-10 rounded-[2rem] relative">
                <div className="flex gap-1 text-yellow-400 mb-6">
                  <Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" />
                </div>
                <p className="text-white text-lg leading-relaxed mb-8 font-light">"We moved our entire remote engineering team over to WabiSeminar for our daily standups. It's fast, free, and secure. What more could you ask for?"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center font-bold text-white text-xl shadow-lg">D</div>
                  <div>
                    <h4 className="text-white font-bold">David Rossi</h4>
                    <p className="text-[#94A3B8] text-sm">CTO, TechFlow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* MODERN FOOTER */}
      <footer className="border-t border-white/10 bg-[#02040A] pt-20 pb-10 px-6 lg:px-8 xl:px-16 relative z-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="col-span-1 md:col-span-5 pr-0 md:pr-12">
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                  <Video className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-2xl tracking-wide text-white">WabiSeminar</span>
            </div>
            <p className="text-[#94A3B8] text-lg leading-relaxed mb-8">The most beautiful, reliable, and premium way to host engaging masterclasses and webinars without limits.</p>
            <div className="flex items-center space-x-2 text-[#94A3B8] font-medium">
              <Shield size={18} className="text-emerald-400"/>
              <span>Secure End-to-End Encryption</span>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Product</h4>
            <ul className="space-y-4 text-[#94A3B8]">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Resources</h4>
            <ul className="space-y-4 text-[#94A3B8]">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Status</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3">
            <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Ready to start?</h4>
            <button 
              onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
              className="w-full py-4 px-6 rounded-xl font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:-translate-y-1"
            >
              Host a Meeting Now
            </button>
          </div>
        </div>
        
        <div className="max-w-[1400px] mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-[#94A3B8]">
          <p>© 2026 WabiSeminar Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </footer>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050816]/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#0A0F24] border border-white/10 rounded-[2rem] max-w-lg w-full p-10 shadow-2xl relative">
            <button 
              onClick={() => setShowInfoModal(false)}
              className="absolute top-6 right-6 text-[#94A3B8] hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-rose-500/20 hover:text-rose-400"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
              <Video className="text-indigo-400" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">About WabiSeminar</h2>
            <div className="space-y-4 text-[#94A3B8] text-lg leading-relaxed">
              <p>
                WabiSeminar is a completely <strong className="text-white">free</strong>, high-quality video conferencing platform designed for seamless collaboration.
              </p>
              <p>
                Whether you're hosting a masterclass, a team sync, or catching up with friends, WabiSeminar provides real-time video, audio, and chat without any time limits or hidden fees.
              </p>
            </div>
            <button 
              onClick={() => setShowInfoModal(false)}
              className="mt-10 w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white py-4 rounded-xl font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              Let's get started!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
