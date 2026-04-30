import { useState } from 'react';

export default function Auth({ onNavigate }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="wf-card w-full max-w-sm p-8 flex flex-col items-center space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">WabiSeminar Live</h1>
        
        <div className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Email</label>
            <input type="email" placeholder="name@example.com" className="wf-input" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Password</label>
            <input type="password" placeholder="••••••••" className="wf-input" />
          </div>
        </div>

        <button 
          className="wf-btn wf-btn-primary w-full"
          onClick={() => onNavigate('dashboard')}
        >
          {isLogin ? 'Login' : 'Register'}
        </button>

        <button 
          className="text-sm text-gray-500 hover:text-gray-800 underline-offset-4 hover:underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Switch to Register' : 'Switch to Login'}
        </button>
      </div>
    </div>
  );
}
