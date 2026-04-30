import { useState } from 'react';
import { Mail, Lock, ArrowRight, Video } from 'lucide-react';

export default function Auth({ onNavigate }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 min-h-screen">
      {/* Background Glow Effects */}
      <div className="bg-glow top-0 left-0"></div>
      <div className="bg-glow bottom-0 right-0 bg-purple-500/10" style={{ animationDelay: '2s' }}></div>

      <div className="premium-card w-full max-w-md p-10 flex flex-col items-center space-y-8 z-10">
        
        {/* Logo/Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Video className="text-indigo-400" size={32} />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">WabiSeminar Live</h1>
          <p className="text-sm text-slate-400">
            {isLogin ? 'Sign in to your account to continue' : 'Create an account to get started'}
          </p>
        </div>
        
        <div className="w-full space-y-5">
          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input type="email" placeholder="name@example.com" className="premium-input pl-11" />
            </div>
          </div>
          
          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input type="password" placeholder="••••••••" className="premium-input pl-11" />
            </div>
          </div>
        </div>

        <div className="w-full space-y-4 pt-2">
          <button 
            className="premium-btn premium-btn-primary w-full group"
            onClick={() => onNavigate('dashboard')}
          >
            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
          </button>

          <button 
            className="w-full text-sm text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
