import { useRef, useState, useEffect } from 'react';
import api from '../services/api.js';
import { roomIdFromPathname } from '../routeUtils.js';
import { 
  Video, LogOut, LogIn, Plus, Users, X, Loader2, 
  Sparkles, Zap, Shield, Clock, Monitor, Moon, ChevronRight, Link,
  CheckCircle, Star, MessageSquare, Menu, Calendar, Play, GraduationCap, BookOpen, Heart
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Dashboard({ onNavigate, onJoinRoom, notify }) {
  const [joinId, setJoinId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [actionError, setActionError] = useState('');
  const [platformStats, setPlatformStats] = useState({ users: 0, meetings: 0, minutes: 0 });
  const createInFlightRef = useRef(false);

  useEffect(() => {
    // Fetch stats
    api.getStats().then(res => {
      if (res && res.success) {
        setPlatformStats(res.data);
      }
    }).catch(console.error);

    // Smooth scroll behavior for the entire page
    document.documentElement.style.scrollBehavior = 'smooth';
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.removeEventListener('scroll', handleScroll);
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


  return (
    <div className="flex flex-col min-h-screen bg-[#050816] light:bg-[#FAFAFA] relative text-white light:text-slate-900 font-sans overflow-x-hidden">
      
      {/* Background Animated Blobs */}
      <div className="fixed bg-purple-600/15 blur-[120px] w-[600px] h-[600px] rounded-2xl top-[-10%] left-[-10%] pointer-events-none"></div>
      <div className="fixed bg-blue-600/10 blur-[120px] w-[500px] h-[500px] rounded-2xl bottom-[10%] right-[-10%] pointer-events-none"></div>

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
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col justify-center space-y-10 lg:space-y-12"
            >
              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white light:text-slate-900">
                Host Engaging <br/>
                <span className="text-blue-500 drop-shadow-[0_0_25px_rgba(59,130,246,0.3)]">
                  Masterclasses
                </span><br/>
                Without Limits
              </h1>
              
              {/* Subtext */}
              <p className="text-[#94A3B8] light:text-slate-600 text-lg sm:text-xl max-w-[550px] leading-relaxed font-light">
                Create a free meeting room instantly or join an existing session in seconds. Built for innovative educators, creators, and teams who value simplicity and connection.
              </p>

              {/* Features Row (Hero) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-2 max-w-[550px]">
                <div className="flex flex-col space-y-4 group cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-blue-500/10 light:bg-blue-50 flex items-center justify-center border border-blue-500/20 light:border-blue-200 group-hover:scale-110 group-hover:bg-blue-500/20 light:group-hover:bg-blue-100 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <Zap size={24} className="text-blue-400 light:text-blue-600 group-hover:animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white light:text-slate-900 text-sm mb-1 group-hover:text-blue-400 transition-colors">Instant Setup</h3>
                    <p className="text-xs text-[#94A3B8] light:text-slate-500 leading-relaxed font-medium">Join in one click</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-4 group cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-orange-500/10 light:bg-orange-50 flex items-center justify-center border border-orange-500/20 light:border-orange-200 group-hover:scale-110 group-hover:bg-orange-500/20 light:group-hover:bg-orange-100 transition-all duration-300 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                    <Users size={24} className="text-orange-400 light:text-orange-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white light:text-slate-900 text-sm mb-1 group-hover:text-orange-400 transition-colors">No Limits</h3>
                    <p className="text-xs text-[#94A3B8] light:text-slate-500 leading-relaxed font-medium">Host endlessly</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-4 group cursor-pointer hidden sm:flex">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 light:bg-emerald-50 flex items-center justify-center border border-emerald-500/20 light:border-emerald-200 group-hover:scale-110 group-hover:bg-emerald-500/20 light:group-hover:bg-emerald-100 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <Shield size={24} className="text-emerald-400 light:text-emerald-600 group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white light:text-slate-900 text-sm mb-1 group-hover:text-emerald-400 transition-colors">Ultra Secure</h3>
                    <p className="text-xs text-[#94A3B8] light:text-slate-500 leading-relaxed font-medium">End-to-end safe</p>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap sm:flex-nowrap gap-5 pt-6 max-w-[600px]">
                <div className="flex-1 min-w-[140px] bg-[#0A0F24]/40 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-3xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-xl light:shadow-sm group relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Users size={24} className="text-blue-400 light:text-blue-600 mb-4 opacity-80" />
                  <div className="text-4xl font-black text-white light:text-slate-900 mb-1 group-hover:scale-105 origin-left transition-transform">
                    {platformStats.users.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-[#94A3B8] light:text-slate-500 tracking-[0.2em] uppercase mt-2">Happy Users</div>
                </div>
                <div className="flex-1 min-w-[140px] bg-[#0A0F24]/40 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-3xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-xl light:shadow-sm group relative overflow-hidden">
                  <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Video size={24} className="text-orange-400 light:text-orange-600 mb-4 opacity-80" />
                  <div className="text-4xl font-black text-white light:text-slate-900 mb-1 group-hover:scale-105 origin-left transition-transform">
                    {platformStats.meetings.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-[#94A3B8] light:text-slate-500 tracking-[0.2em] uppercase mt-2">Meetings Hosted</div>
                </div>
                <div className="flex-1 min-w-[140px] bg-[#0A0F24]/40 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-3xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-xl light:shadow-sm group relative overflow-hidden hidden sm:block">
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Clock size={24} className="text-emerald-400 light:text-emerald-600 mb-4 opacity-80" />
                  <div className="text-4xl font-black text-white light:text-slate-900 mb-1 group-hover:scale-105 origin-left transition-transform">
                    {platformStats.minutes.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-[#94A3B8] light:text-slate-500 tracking-[0.2em] uppercase mt-2">Minutes Shared</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Main Interaction Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
              className="relative lg:ml-auto w-full max-w-[540px]"
            >
              {/* Interactive Floating Action Button */}
              <button 
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="absolute -top-5 -right-5 h-14 bg-[#050816] light:bg-white border-2 border-blue-500/50 light:border-blue-200 rounded-full flex items-center shadow-[0_0_40px_rgba(59,130,246,0.5)] light:shadow-xl z-20 transition-all duration-300 hover:border-blue-400 group cursor-pointer"
                title="Create a new meeting room"
              >
                <div className="flex items-center w-14 group-hover:w-[140px] transition-all duration-500 ease-out h-full overflow-hidden">
                  <div className="w-14 h-full flex items-center justify-center shrink-0">
                    <Plus size={26} className="text-blue-400 light:text-blue-600 group-hover:rotate-90 transition-transform duration-500" />
                  </div>
                  <span className="text-sm font-bold text-blue-100 light:text-blue-900 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 -ml-2 pr-5">
                    New Room
                  </span>
                </div>
              </button>

              {/* The Main Glassmorphic Card */}
              <div className="bg-[#0A0F24]/80 light:bg-white/95 backdrop-blur-2xl border border-white/10 light:border-slate-200 rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] light:shadow-2xl">

                {/* Subtle ambient glow inside card */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                {/* Start Meeting Section */}
                <div className="mb-12 relative z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-blue-500/10 light:bg-blue-50 p-3 rounded-2xl border border-blue-500/20 light:border-blue-100">
                      <Video className="text-blue-400 light:text-blue-600" size={26} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white light:text-slate-900 tracking-tight">Start a New Meeting</h2>
                  </div>
                  <p className="text-[15px] text-[#94A3B8] light:text-slate-500 mb-6 font-medium">Create a secure room instantly and invite others to join.</p>
                  
                  <motion.button 
                    type="button"
                    whileHover={{ scale: isCreating ? 1 : 1.02 }}
                    whileTap={{ scale: isCreating ? 1 : 0.98 }}
                    className={`group w-full py-4.5 px-6 rounded-full text-[16px] font-bold flex items-center justify-between text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:shadow-[0_10px_40px_rgba(59,130,246,0.5)] ${isCreating ? 'opacity-75 cursor-not-allowed' : ''}`}
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
                    <ChevronRight size={22} className="opacity-90 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
                
                {/* Divider */}
                <div className="relative flex items-center justify-center mb-12 z-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10 light:border-slate-200"></div>
                  </div>
                  <div className="relative bg-[#0A0F24] light:bg-white px-4 py-2 rounded-full text-xs font-bold tracking-widest text-[#94A3B8] light:text-slate-400 border border-white/10 light:border-slate-200 shadow-sm uppercase">
                    or
                  </div>
                </div>

                {/* Join Meeting Section */}
                <div className="mb-10 relative z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-orange-500/10 light:bg-orange-50 p-3 rounded-2xl border border-orange-500/20 light:border-orange-100">
                      <Users className="text-orange-400 light:text-orange-600" size={26} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white light:text-slate-900 tracking-tight">Join an Existing Meeting</h2>
                  </div>
                  <p className="text-[15px] text-[#94A3B8] light:text-slate-500 mb-6 font-medium">Enter a room ID or link shared by your host.</p>
                  
                  <div className="flex flex-col space-y-5">
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-[#94A3B8] light:text-slate-400 font-bold">
                        #
                      </div>
                      <input 
                        type="text" 
                        value={joinId}
                        onChange={(e) => setJoinId(e.target.value)}
                        placeholder="Enter Room ID (e.g. abc-defg-hij)" 
                        className="w-full bg-[#050816]/50 light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-full pl-12 pr-6 py-4.5 text-[15px] text-white light:text-slate-900 placeholder-[#94A3B8] light:placeholder-slate-400 focus:border-orange-500/50 light:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 light:focus:ring-orange-200 outline-none transition-all shadow-inner"
                        onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                      />
                    </div>
                    <motion.button 
                      type="button"
                      whileHover={{ scale: (!joinId.trim() || isJoining) ? 1 : 1.02 }}
                      whileTap={{ scale: (!joinId.trim() || isJoining) ? 1 : 0.98 }}
                      className={`group w-full py-4.5 px-6 rounded-full text-[16px] font-bold flex items-center justify-between text-white bg-orange-600 hover:bg-orange-500 transition-all shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:shadow-[0_10px_40px_rgba(249,115,22,0.5)] ${(!joinId.trim() || isJoining) ? 'opacity-75 cursor-not-allowed' : ''}`}
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
                      <ChevronRight size={22} className="opacity-90 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </div>

                {/* Bottom Feature Highlights */}
                <div className="flex justify-between items-center bg-white/5 light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-2xl p-4 relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 light:bg-blue-100 flex items-center justify-center">
                      <Monitor size={18} className="text-blue-400 light:text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-white light:text-slate-900">No Downloads</h4>
                      <p className="text-[11px] font-medium text-[#94A3B8] light:text-slate-500">Works on any browser</p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/10 light:bg-slate-200"></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 light:bg-emerald-100 flex items-center justify-center">
                      <Sparkles size={18} className="text-emerald-400 light:text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-white light:text-slate-900">HD Quality</h4>
                      <p className="text-[11px] font-medium text-[#94A3B8] light:text-slate-500">Crystal clear media</p>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </section>


        {/* TRUSTED BY STRIP */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="border-y border-white/5 light:border-slate-200 bg-white/[0.01] py-12 relative z-10 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-slate-400 light:text-slate-500 text-sm font-bold tracking-[0.2em] uppercase mb-8">Trusted by innovative teams worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50 light:opacity-70 grayscale hover:grayscale-0 transition-all duration-700">
              <div className="text-2xl font-black flex items-center gap-3 text-white light:text-slate-800"><div className="w-8 h-8 rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/50"></div> Acme Corp</div>
              <div className="text-2xl font-black flex items-center gap-3 text-white light:text-slate-800"><div className="w-8 h-8 rounded-2xl bg-indigo-500 shadow-lg shadow-emerald-500/50"></div> Globex</div>
              <div className="text-2xl font-black flex items-center gap-3 text-white light:text-slate-800"><div className="w-8 h-8 rounded-tl-2xl rounded-br-2xl bg-orange-500 shadow-lg shadow-orange-500/50"></div> Stark Ind</div>
              <div className="text-2xl font-black flex items-center gap-3 text-white light:text-slate-800 hidden md:flex"><div className="w-8 h-8 rotate-45 bg-blue-500 shadow-lg shadow-blue-500/50"></div> Initech</div>
            </div>
          </div>
        </motion.section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-24 lg:py-32 relative z-10 px-6 lg:px-8 xl:px-16">
          <div className="max-w-[1400px] mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white light:text-slate-900">Everything you need for <br className="hidden md:block"/><span className="text-indigo-500">perfect seminars</span></h2>
              <p className="text-[#94A3B8] light:text-slate-600 text-lg md:text-xl leading-relaxed">WabiSeminar brings together the best tools for video collaboration in one beautiful, frictionless package. Focus on your audience, not the tech.</p>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {/* Feature 1 */}
              <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }} className="bg-[#0A0F24]/60 light:bg-white backdrop-blur-lg light:backdrop-blur-none border border-white/5 light:border-slate-200 hover:border-indigo-500/30 light:hover:border-indigo-300 p-10 rounded-[2rem] hover:-translate-y-2 transition-all duration-500 shadow-xl light:shadow-md hover:shadow-[0_20px_50px_-15px_rgba(99,102,241,0.2)] light:hover:shadow-lg group">
                <div className="w-16 h-16 bg-indigo-500/10 light:bg-indigo-50 group-hover:bg-indigo-500/20 light:group-hover:bg-indigo-100 transition-colors text-indigo-400 light:text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner light:shadow-none border border-indigo-500/20 light:border-indigo-200"> 
                  <Video size={32}/> 
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white light:text-slate-900">Ultra HD Video</h3>
                <p className="text-[#94A3B8] light:text-slate-500 leading-relaxed text-lg">Experience crystal clear video and audio quality powered by advanced WebRTC architecture, ensuring you always look your best.</p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }} className="bg-[#0A0F24]/60 light:bg-white backdrop-blur-lg light:backdrop-blur-none border border-white/5 light:border-slate-200 hover:border-emerald-500/30 light:hover:border-emerald-300 p-10 rounded-[2rem] hover:-translate-y-2 transition-all duration-500 shadow-xl light:shadow-md hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.2)] light:hover:shadow-lg group">
                <div className="w-16 h-16 bg-emerald-500/10 light:bg-emerald-50 group-hover:bg-emerald-500/20 light:group-hover:bg-emerald-100 transition-colors text-emerald-400 light:text-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner light:shadow-none border border-emerald-500/20 light:border-emerald-200"> 
                  <MessageSquare size={32}/> 
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white light:text-slate-900">Real-time Chat</h3>
                <p className="text-[#94A3B8] light:text-slate-500 leading-relaxed text-lg">Keep your audience engaged with lightning-fast built-in chat. Share links, answer questions, and foster community instantly.</p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }} className="bg-[#0A0F24]/60 light:bg-white backdrop-blur-lg light:backdrop-blur-none border border-white/5 light:border-slate-200 hover:border-purple-500/30 light:hover:border-purple-300 p-10 rounded-[2rem] hover:-translate-y-2 transition-all duration-500 shadow-xl light:shadow-md hover:shadow-[0_20px_50px_-15px_rgba(168,85,247,0.2)] light:hover:shadow-lg group">
                <div className="w-16 h-16 bg-purple-500/10 light:bg-purple-50 group-hover:bg-purple-500/20 light:group-hover:bg-purple-100 transition-colors text-purple-400 light:text-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner light:shadow-none border border-purple-500/20 light:border-purple-200"> 
                  <Monitor size={32}/> 
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white light:text-slate-900">Screen Sharing</h3>
                <p className="text-[#94A3B8] light:text-slate-500 leading-relaxed text-lg">Present your masterclass seamlessly. Share your entire screen, specific windows, or browser tabs with zero lag.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section id="testimonials" className="py-24 lg:py-32 relative z-10 bg-gradient-to-b from-transparent to-[#0A0F24] light:to-white px-6 lg:px-8 xl:px-16">
          <div className="max-w-[1400px] mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white light:text-slate-900">Loved by educators</h2>
              <p className="text-[#94A3B8] light:text-slate-600 text-lg md:text-xl leading-relaxed">See why thousands of professionals choose WabiSeminar over legacy video conferencing platforms.</p>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {/* Testimonial 1 */}
              <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }} className="bg-[#160B2A]/40 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-purple-500/20 light:border-slate-200 p-10 rounded-[2rem] relative light:shadow-md">
                <div className="flex gap-1 text-yellow-400 mb-6">
                  <Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" />
                </div>
                <p className="text-white light:text-slate-700 text-lg leading-relaxed mb-8 font-light">"WabiSeminar completely changed how I host my design masterclasses. The UI is gorgeous, and my students love that they don't have to download any software."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center font-bold text-white light:text-slate-900 text-xl shadow-lg">S</div>
                  <div>
                    <h4 className="text-white light:text-slate-900 font-bold">kenenisa beyan</h4>
                    <p className="text-[#94A3B8] light:text-slate-500 text-sm">Lead Designer, StudioX</p>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial 2 */}
              <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }} className="bg-[#0A241A]/40 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-emerald-500/20 light:border-slate-200 p-10 rounded-[2rem] relative md:-translate-y-6 light:shadow-md">
                <div className="flex gap-1 text-yellow-400 mb-6">
                  <Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" />
                </div>
                <p className="text-white light:text-slate-700 text-lg leading-relaxed mb-8 font-light">"The waiting room feature is perfect for managing my 1-on-1 coaching sessions. The video quality has been incredibly stable even on lower bandwidths."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center font-bold text-white light:text-slate-900 text-xl shadow-lg">M</div>
                  <div>
                    <h4 className="text-white light:text-slate-900 font-bold">yerosan girma</h4>
                    <p className="text-[#94A3B8] light:text-slate-500 text-sm">Executive Coach</p>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial 3 */}
              <motion.div variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }} className="bg-[#0A0F24]/80 light:bg-white backdrop-blur-md light:backdrop-blur-none border border-blue-500/20 light:border-slate-200 p-10 rounded-[2rem] relative light:shadow-md">
                <div className="flex gap-1 text-yellow-400 mb-6">
                  <Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" /><Star size={20} fill="currentColor" />
                </div>
                <p className="text-white light:text-slate-700 text-lg leading-relaxed mb-8 font-light">"We moved our entire remote engineering team over to WabiSeminar for our daily standups. It's fast, free, and secure. What more could you ask for?"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center font-bold text-white light:text-slate-900 text-xl shadow-lg">D</div>
                  <div>
                    <h4 className="text-white light:text-slate-900 font-bold">dagin</h4>
                    <p className="text-[#94A3B8] light:text-slate-500 text-sm">CTO, TechFlow</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

      </main>



      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050816]/90 light:bg-slate-50/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#0A0F24] light:bg-white border border-white/10 light:border-slate-200 rounded-[2rem] max-w-lg w-full p-10 shadow-2xl relative">
            <button className="cursor-pointer"  
              onClick={() => setShowInfoModal(false)}
              className="absolute top-6 right-6 text-[#94A3B8] light:text-slate-500 hover:text-white light:text-slate-900 transition-colors bg-white/5 light:bg-slate-100 p-2 rounded-2xl hover:bg-rose-500/20 hover:text-rose-400"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
              <Video className="text-indigo-400" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white light:text-slate-900 mb-4">About WabiSeminar</h2>
            <div className="space-y-4 text-[#94A3B8] light:text-slate-500 text-lg leading-relaxed">
              <p>
                WabiSeminar is a completely <strong className="text-white light:text-slate-900">free</strong>, high-quality video conferencing platform designed for seamless collaboration.
              </p>
              <p>
                Whether you're hosting a masterclass, a team sync, or catching up with friends, WabiSeminar provides real-time video, audio, and chat without any time limits or hidden fees.
              </p>
            </div>
            <button className="cursor-pointer"  
              onClick={() => setShowInfoModal(false)}
              className="mt-10 w-full bg-indigo-500 hover:from-indigo-400 hover:to-purple-400 text-white light:text-slate-900 py-4 rounded-2xl font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              Let's get started!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
