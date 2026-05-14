import { useRef, useState, useEffect } from 'react';
import api from '../services/api.js';
import { roomIdFromPathname } from '../routeUtils.js';
import { 
  Video, LogOut, LogIn, Plus, Users, X, Loader2, 
  Sparkles, Zap, Shield, Clock, Monitor, Moon, ChevronRight, Link 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ onNavigate, onJoinRoom, notify }) {
  const [joinId, setJoinId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [actionError, setActionError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const createInFlightRef = useRef(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
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
      
      // Handle authentication errors
      if (response.status === 401) {
        showError('Your session expired. Please log in again.');
        localStorage.clear(); // Clear all stored data
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
    <div className="flex-1 flex flex-col min-h-screen bg-[#050816] relative overflow-hidden text-white font-sans">
      
      {/* Background Animated Blobs */}
      <div className="absolute bg-purple-600/15 blur-[120px] w-[600px] h-[600px] rounded-full top-[-10%] left-[-10%] pointer-events-none"></div>
      <div className="absolute bg-blue-600/10 blur-[120px] w-[500px] h-[500px] rounded-full bottom-[-10%] right-[-10%] pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="h-24 flex items-center justify-between px-8 xl:px-16 z-20 relative">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Video className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl tracking-wide text-white">
            WabiSeminar
          </span>
        </div>

        {/* Links */}
        <nav className="hidden lg:flex items-center space-x-6">
          <a href="#" className="text-sm font-medium text-purple-300 bg-purple-600/20 px-6 py-2 rounded-full border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.15)]">
            Home
          </a>
          <a href="#" className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">
            Features
          </a>
          <a href="#" className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#" className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#" className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors">
            <Moon size={18} />
          </button>
          <button 
            className="flex items-center space-x-2 text-sm font-medium text-[#94A3B8] hover:text-white bg-white/5 border border-white/10 px-5 py-2.5 rounded-full hover:bg-white/10 transition-all"
            onClick={handleAuthAction}
          >
            {isAuthenticated ? (
              <>
                <LogOut size={16} />
                <span>Logout</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-6 xl:px-16 z-10 relative pb-12">
        <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {actionError && (
            <div className="lg:col-span-2 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm">
              {actionError}
            </div>
          )}

          {/* Left Column - Hero Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center space-y-8"
          >
            {/* Free Pill */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-[#160B2A] text-purple-300 w-fit text-xs font-semibold shadow-[0_0_10px_rgba(147,51,234,0.1)]">
              <Sparkles size={14} className="text-purple-400" />
              <span>100% Free Forever</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight text-white">
              Host Engaging <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                Masterclasses
              </span><br/>
              Without Limits
            </h1>
            
            {/* Subtext */}
            <p className="text-[#94A3B8] text-[17px] max-w-[500px] leading-relaxed">
              Create a free meeting room instantly or join an existing session in seconds. Built for educators, creators, and teams who value simplicity and connection.
            </p>

            {/* Features Row */}
            <div className="grid grid-cols-3 gap-6 pt-4 max-w-[500px]">
              <div className="flex flex-col space-y-3">
                <div className="w-[52px] h-[52px] rounded-[14px] bg-[#1E113C] flex items-center justify-center border border-purple-500/20 shadow-inner">
                  <Zap size={22} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-[13px] mb-1">Instant Setup</h3>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">Create or join a room<br/>in just one click</p>
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="w-[52px] h-[52px] rounded-[14px] bg-[#0A241A] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                  <Users size={22} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-[13px] mb-1">No Limits</h3>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">Host unlimited sessions<br/>absolutely free</p>
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="w-[52px] h-[52px] rounded-[14px] bg-[#331C0D] flex items-center justify-center border border-orange-500/20 shadow-inner">
                  <Shield size={22} className="text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-[13px] mb-1">Secure & Private</h3>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">Your meetings are safe<br/>and encrypted</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4 pt-6 max-w-[540px]">
              <div className="flex-1 bg-[#0A0F24]/80 border border-white/5 rounded-[20px] p-5 relative overflow-hidden group">
                <Users size={20} className="text-indigo-400 mb-3" />
                <div className="text-[26px] font-bold text-white mb-0.5">10K+</div>
                <div className="text-[11px] font-medium text-[#94A3B8]">Happy Users</div>
              </div>
              <div className="flex-1 bg-[#0A0F24]/80 border border-white/5 rounded-[20px] p-5 relative overflow-hidden group">
                <Users size={20} className="text-emerald-400 mb-3" />
                <div className="text-[26px] font-bold text-white mb-0.5">50K+</div>
                <div className="text-[11px] font-medium text-[#94A3B8]">Meetings Hosted</div>
              </div>
              <div className="flex-1 bg-[#0A0F24]/80 border border-white/5 rounded-[20px] p-5 relative overflow-hidden group">
                <Clock size={20} className="text-purple-400 mb-3" />
                <div className="text-[26px] font-bold text-white mb-0.5">1M+</div>
                <div className="text-[11px] font-medium text-[#94A3B8]">Minutes Connected</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Main Interaction Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:ml-auto w-full max-w-[540px]"
          >
            {/* The Main Glowing Card */}
            <div className="bg-[#0A0F24]/90 backdrop-blur-2xl border border-purple-500/40 rounded-[2rem] p-10 shadow-[0_0_80px_-15px_rgba(124,58,237,0.35)] relative">
              
              {/* Floating + Icon */}
              <div className="absolute -top-5 -right-4 w-[50px] h-[50px] bg-[#050816] border border-purple-500/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.7)] z-20">
                <Plus size={24} className="text-indigo-300" />
              </div>

              {/* Start Meeting Section */}
              <div className="mb-10">
                <div className="flex items-center space-x-3 mb-2">
                  <Video className="text-indigo-400" size={24} />
                  <h2 className="text-[22px] font-bold text-white">Start a New Meeting</h2>
                </div>
                <p className="text-[13px] text-[#94A3B8] mb-6">Create a room and invite others to join.</p>
                
                <button 
                  type="button"
                  className={`w-full py-4 px-6 rounded-2xl text-[15px] font-semibold text-white flex items-center justify-between transition-all bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 shadow-[0_10px_20px_-10px_rgba(99,102,241,0.6)] ${isCreating ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                >
                  <div className="flex items-center">
                    {isCreating ? (
                      <Loader2 className="mr-2 animate-spin" size={20} />
                    ) : (
                      <Video className="mr-3" size={20} />
                    )}
                    <span>Create Instant Room</span>
                  </div>
                  <ChevronRight size={20} className="opacity-90" />
                </button>
              </div>
              
              {/* Divider */}
              <div className="relative flex items-center justify-center mb-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative bg-[#0A0F24] w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-bold text-[#94A3B8] border border-white/10">
                  OR
                </div>
              </div>

              {/* Join Meeting Section */}
              <div className="mb-10">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="text-emerald-400" size={24} />
                  <h2 className="text-[22px] font-bold text-white">Join an Existing Meeting</h2>
                </div>
                <p className="text-[13px] text-[#94A3B8] mb-6">Enter a room ID shared by your host.</p>
                
                <div className="flex flex-col space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#94A3B8] font-medium">
                      #
                    </div>
                    <input 
                      type="text" 
                      value={joinId}
                      onChange={(e) => setJoinId(e.target.value)}
                      placeholder="Enter Room ID (e.g. abc-defg-hij)" 
                      className="w-full bg-[#050816] border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-[14px] text-white placeholder-[#475569] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" 
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                    />
                  </div>
                  <button 
                    type="button"
                    className={`w-full py-4 px-6 rounded-2xl text-[15px] font-semibold text-white flex items-center justify-between transition-all bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] ${!joinId.trim() || isJoining ? 'opacity-80' : 'hover:-translate-y-0.5'}`}
                    onClick={handleJoinRoom}
                  >
                    <div className="flex items-center">
                      {isJoining ? (
                        <Loader2 className="mr-2 animate-spin" size={20} />
                      ) : (
                        <Link className="mr-3" size={20} />
                      )}
                      <span>Join Room</span>
                    </div>
                    <ChevronRight size={20} className="opacity-90" />
                  </button>
                </div>
              </div>

              {/* Bottom Feature Highlights */}
              <div className="flex justify-between border-t border-white/5 pt-6">
                <div className="flex items-start space-x-3">
                  <Monitor size={18} className="text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="text-[13px] font-semibold text-white">No Downloads</h4>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-tight">Web-based, works<br/>on any device</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Video size={18} className="text-indigo-400 mt-0.5" />
                  <div>
                    <h4 className="text-[13px] font-semibold text-white">HD Quality</h4>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-tight">Crystal clear audio<br/>and video</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Monitor size={18} className="text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-[13px] font-semibold text-white">Screen Share</h4>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-tight">Present and<br/>collaborate easily</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

        </div>

        {/* Footer Trust Section */}
        <div className="mt-20 pb-4 flex items-center justify-center space-x-2 text-[#94A3B8] text-[13px]">
          <Shield size={16} />
          <span>Trusted by educators and professionals worldwide</span>
        </div>
      </main>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050816]/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#0A0F24] border border-white/10 rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowInfoModal(false)}
              className="absolute top-6 right-6 text-[#94A3B8] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">About WabiSeminar</h2>
            <div className="space-y-4 text-[#94A3B8]">
              <p>
                WabiSeminar is a completely <strong>free</strong>, high-quality video conferencing platform designed for seamless collaboration.
              </p>
              <p>
                Whether you're hosting a masterclass, a team sync, or catching up with friends, WabiSeminar provides real-time video, audio, and chat without any time limits or hidden fees.
              </p>
            </div>
            <button 
              onClick={() => setShowInfoModal(false)}
              className="mt-8 w-full bg-indigo-500 hover:bg-indigo-400 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Let's get started!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
