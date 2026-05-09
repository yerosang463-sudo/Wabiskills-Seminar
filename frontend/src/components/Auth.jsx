import { useState } from 'react';
import { Mail, Lock, ArrowRight, Video, Loader2 } from 'lucide-react';
import api from '../services/api';

const GOOGLE_CLIENT_ID = '148617595998-ojlmp47m5ith9jdevm376gcrmhkb87kd.apps.googleusercontent.com';

export default function Auth({ onNavigate }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isLogin && !username) {
      setError('Please enter a username.');
      return;
    }

    setIsLoading(true);
    
    try {
      let response;
      if (isLogin) {
        response = await api.login(email, password);
      } else {
        response = await api.register(username, email, password);
      }

      if (response.success) {
        // Store token
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user || response.data));
        }
        setIsLoading(false);
        onNavigate('dashboard');
      } else {
        setError(response.message || 'Authentication failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    window.location.href = `${apiUrl.replace('/api', '')}/auth/google`;
  };

  // Check for token in URL (from OAuth callback)
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.location.href = window.location.pathname;
    }
  });

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
        
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2 group">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Username</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe" 
                  className="premium-input pl-4" 
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-2 group">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com" 
                className="premium-input pl-11" 
                required
              />
            </div>
          </div>
          
          <div className="space-y-2 group">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
              {isLogin && (
                <button type="button" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="premium-input pl-11" 
                required
              />
            </div>
          </div>

          <div className="w-full pt-4 space-y-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="premium-btn premium-btn-primary w-full group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </>
              )}
            </button>

            {isLogin && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-950 text-slate-500">Or continue with</span>
                </div>
              </div>
            )}

            {isLogin && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="premium-btn w-full flex items-center justify-center space-x-2 bg-white text-slate-900 hover:bg-slate-100"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </button>
            )}

            <button 
              type="button"
              className="w-full text-sm text-slate-400 hover:text-white transition-colors"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
