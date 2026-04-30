import { Video, LogOut, Plus, Users, LayoutDashboard } from 'lucide-react';

export default function Dashboard({ onNavigate }) {
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
                className="premium-btn premium-btn-primary w-full py-4 text-base shadow-indigo-500/25"
                onClick={() => onNavigate('meeting')}
              >
                Create Instant Room
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
                  placeholder="Enter Room ID or Link" 
                  className="premium-input bg-slate-950/80" 
                />
                <button 
                  className="premium-btn premium-btn-secondary w-full"
                  onClick={() => onNavigate('meeting')}
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
