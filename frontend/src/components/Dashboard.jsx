import { useState } from 'react';
import { resolveApiBase } from '../utils/url.js';
import { Video, LogOut, Plus, Users, LayoutDashboard } from 'lucide-react';

export default function Dashboard({ onNavigate, onJoinRoom }) {
  const [joinId, setJoinId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      // Generate a Google Meet style random ID: xxx-xxxx-xxx
      const generateSegment = (length) => Math.random().toString(36).substring(2, 2 + length);
      const newRoomId = `${generateSegment(3)}-${generateSegment(4)}-${generateSegment(3)}`;
      
      // Save room to database
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${resolveApiBase()}/rooms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ roomId: newRoomId })
        });
        
        if (response.ok) {
          console.log('Room saved to database:', newRoomId);
        } else {
          console.error('Failed to save room to database');
        }
      }
      
      onJoinRoom(newRoomId);
    } catch (error) {
      console.error('Error creating room:', error);
      // Still navigate to room even if database save fails
      onJoinRoom(newRoomId);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = () => {
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

    onJoinRoom(id);
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
          
          {/* Welcome Section */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit text-sm font-medium">
              <LayoutDashboard size={14} />
              <span>Dashboard Overview</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to host your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">masterclass?</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md">
              Create a new premium meeting room or join an existing session with your team in seconds.
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
    </div>
  );
}
