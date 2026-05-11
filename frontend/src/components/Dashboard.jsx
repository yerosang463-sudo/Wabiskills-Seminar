import { useState } from 'react';
import { resolveApiBase } from '../utils/url.js';
import { Video, LogOut, Plus, Users, LayoutDashboard, X } from 'lucide-react';

export default function Dashboard({ onNavigate, onJoinRoom }) {
  const [joinId, setJoinId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setActionError('');
    try {
      // Generate a Google Meet style random ID: xxx-xxxx-xxx
      const generateSegment = (length) => Math.random().toString(36).substring(2, 2 + length);
      const newRoomId = `${generateSegment(3)}-${generateSegment(4)}-${generateSegment(3)}`;
      
      // Save room to database
      const token = localStorage.getItem('token');
      if (!token) {
        setActionError('Your session expired. Please log in again.');
        onNavigate('auth');
        return;
      }

      const response = await fetch(`${resolveApiBase()}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roomId: newRoomId })
      });

      if (!response.ok) {
        let msg = 'Failed to create room on server.';
        try {
          const data = await response.json();
          if (data?.message) msg = data.message;
        } catch {
          // ignore
        }
        setActionError(msg);
        return;
      }

      onJoinRoom(newRoomId);
    } catch (error) {
      console.error('Error creating room:', error);
      setActionError('Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    setActionError('');
    let id = joinId.trim();
    if (!id) return;
    
    // Extract ID if the user pastes a full URL (e.g., https://domain.com/abc-defg-hij)
    if (id.includes('/')) {
      const parts = id.split('/');
      id = parts[parts.length - 1];
    }
    
    // Remove query parameters if any
    if (id.includes('?')) {
      id = id.split('?')[0];
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setActionError('Your session expired. Please log in again.');
        onNavigate('auth');
        return;
      }
      const response = await fetch(`${resolveApiBase()}/rooms/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        setActionError('Room not found. Please check the meeting link/ID.');
        return;
      }
      onJoinRoom(id);
    } catch (error) {
      console.error('Error joining room:', error);
      setActionError('Network error. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 relative overflow-hidden text-slate-50">
      {/* Background Glows */}
      <div className="bg-glow -top-40 -left-40 opacity-70"></div>
      <div className="bg-glow -bottom-40 -right-40 bg-purple-600/10 opacity-70" style={{ animationDelay: '3s' }}></div>

      {/* Top Navbar */}
      <header className="h-16 border-b border-white/5 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 z-20 sticky top-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Video className="text-white" size={18} />
          </div>
          <span className="font-bold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            WabiSeminar
          </span>
        </div>
        <button 
          className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          onClick={() => onNavigate('auth')}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">

          {actionError && (
            <div className="md:col-span-2 premium-card p-4 border border-red-500/20 bg-red-500/10 text-red-200 text-sm">
              {actionError}
            </div>
          )}
          
          {/* Welcome Section */}
          <div className="flex flex-col justify-center space-y-6">
            <button 
              onClick={() => setShowInfoModal(true)}
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit text-sm font-medium hover:bg-indigo-500/20 transition-colors cursor-pointer"
            >
              <LayoutDashboard size={14} />
              <span>Dashboard Overview</span>
            </button>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to host your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">masterclass?</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md">
              Create a new completely free meeting room or join an existing session with your team in seconds. No limits, 100% free.
            </p>
          </div>

          {/* Actions Card */}
          <div className="premium-card p-8 flex flex-col space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Plus className="mr-2 text-indigo-400" size={20} /> New Meeting
              </h2>
              <button 
                className={`premium-btn premium-btn-primary w-full py-4 text-base shadow-indigo-500/25 ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleCreateRoom}
                disabled={isCreating}
              >
                {isCreating ? 'Creating Room...' : 'Create Instant Room'}
              </button>
            </div>
            
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative bg-slate-900 px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Or join existing
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Users className="mr-2 text-purple-400" size={20} /> Join Meeting
              </h2>
              <div className="flex flex-col space-y-3">
                <input 
                  type="text" 
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  placeholder="Enter Room ID (e.g. abc-defg-hij)" 
                  className="premium-input bg-slate-950/80" 
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
                <button 
                  className={`premium-btn w-full ${joinId.trim() ? 'premium-btn-secondary' : 'bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed'}`}
                  onClick={handleJoinRoom}
                  disabled={!joinId.trim()}
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">About WabiSeminar</h2>
            <div className="space-y-4 text-slate-300">
              <p>
                WabiSeminar is a completely <strong>free</strong>, high-quality video conferencing platform designed for seamless collaboration.
              </p>
              <p>
                Whether you're hosting a masterclass, a team sync, or catching up with friends, WabiSeminar provides real-time video, audio, and chat without any time limits or hidden fees.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400">
                <li>Instant meeting creation</li>
                <li>Secure Waiting Room for guests</li>
                <li>Real-time Text Chat</li>
                <li>100% Free forever</li>
              </ul>
            </div>
            <button 
              onClick={() => setShowInfoModal(false)}
              className="mt-8 w-full premium-btn bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-semibold shadow-lg shadow-indigo-500/25 transition-all"
            >
              Let's get started!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
