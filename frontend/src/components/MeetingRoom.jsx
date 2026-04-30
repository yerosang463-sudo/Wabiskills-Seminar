import { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Send, User, X, Copy, Check } from 'lucide-react';

export default function MeetingRoom({ onLeave, roomId }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomId || 'xyz-abcd-efg');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#202124] text-white font-sans">
      
      {/* 1. MAIN VIDEO AREA */}
      <div className={`flex-1 flex flex-col transition-all duration-300 relative ${isChatOpen ? 'pr-0 md:pr-80' : 'pr-0'}`}>
        
        {/* Video Grid */}
        <div className="flex-1 p-4 md:p-6 pb-24 md:pb-28 overflow-y-auto w-full h-full flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full max-w-7xl max-h-[800px]">
            
            {/* You (Active Speaker) */}
            <div className="bg-[#3c4043] rounded-2xl relative overflow-hidden flex items-center justify-center border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)] group">
              {isVideoOff ? (
                <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <User size={40} className="text-indigo-400" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800"></div>
              )}
              
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-sm font-medium px-3 py-1.5 rounded-lg flex items-center space-x-2">
                {isMuted && <MicOff size={14} className="text-red-400" />}
                <span>You</span>
              </div>
              
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/50">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* User 2 */}
            <div className="bg-[#3c4043] rounded-2xl relative overflow-hidden flex items-center justify-center group border border-transparent">
              <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-4xl text-purple-400 font-semibold">S</span>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-sm font-medium px-3 py-1.5 rounded-lg flex items-center space-x-2">
                <MicOff size={14} className="text-red-400" />
                <span>Sarah Jenkins</span>
              </div>
            </div>

            {/* User 3 */}
            <div className="bg-[#3c4043] rounded-2xl relative overflow-hidden flex items-center justify-center group border border-transparent">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-4xl text-emerald-400 font-semibold">M</span>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-sm font-medium px-3 py-1.5 rounded-lg flex items-center space-x-2">
                <MicOff size={14} className="text-red-400" />
                <span>Mike T.</span>
              </div>
            </div>

            {/* User 4 */}
            <div className="bg-[#3c4043] rounded-2xl relative overflow-hidden flex items-center justify-center group border border-transparent">
               <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-4xl text-amber-400 font-semibold">A</span>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-sm font-medium px-3 py-1.5 rounded-lg flex items-center space-x-2">
                <MicOff size={14} className="text-red-400" />
                <span>Alex R.</span>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM LEFT INFO (Google Meet Style) */}
        <div className="absolute bottom-6 left-6 z-20 flex items-center text-white pointer-events-auto">
          <span className="text-[15px] font-medium mr-4">{currentTime}</span>
          <div className="w-px h-4 bg-white/30 mr-4 hidden sm:block"></div>
          <span className="text-[15px] font-medium hidden sm:block mr-4">WabiSeminar Design Review</span>
          <div className="w-px h-4 bg-white/30 mr-4 hidden sm:block"></div>
          <span className="text-[15px] font-mono mr-2">{roomId || 'xyz-abcd-efg'}</span>
          <button 
            onClick={handleCopyLink}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white relative group"
            title="Copy Room ID"
          >
            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {copied ? 'Copied!' : 'Copy join info'}
            </div>
          </button>
        </div>

        {/* BOTTOM CONTROL BAR (Floating Center) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-[#3c4043] px-6 py-3 rounded-full flex items-center space-x-4 shadow-xl">
            
            <button 
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isMuted ? 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-lg shadow-red-500/20' : 'bg-[#4a4d51] hover:bg-[#5f6368] text-white'}`}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button 
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isVideoOff ? 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-lg shadow-red-500/20' : 'bg-[#4a4d51] hover:bg-[#5f6368] text-white'}`}
              onClick={() => setIsVideoOff(!isVideoOff)}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            <button 
              className="w-16 h-12 rounded-[24px] flex items-center justify-center bg-[#ea4335] text-white hover:bg-[#d93025] transition-all shadow-lg shadow-red-500/30 ml-2"
              onClick={onLeave}
            >
              <PhoneOff size={22} />
            </button>
          </div>
        </div>
        
        {/* BOTTOM RIGHT (Chat toggle) */}
        <div className="absolute bottom-6 right-6 z-20">
          <button 
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${isChatOpen ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[#3c4043] hover:bg-[#4a4d51] text-white'}`}
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageSquare size={20} />
          </button>
        </div>

      </div>

      {/* 2. RIGHT CHAT PANEL (Google Meet Style) */}
      <div className={`
        fixed md:absolute right-0 top-0 bottom-0 w-full md:w-80 bg-[#202124] md:border-l border-[#3c4043] flex flex-col z-30 transition-transform duration-300 shadow-2xl md:shadow-none
        ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Chat Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#3c4043]">
          <span className="text-lg font-medium text-white">In-call messages</span>
          <button 
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
            onClick={() => setIsChatOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Info Banner */}
        <div className="bg-indigo-500/10 p-4 text-sm text-indigo-200 border-b border-indigo-500/20 leading-relaxed">
          Messages can only be seen by people in the call and are deleted when the call ends.
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-sm font-semibold text-white">Sarah Jenkins</span>
              <span className="text-xs text-slate-500">10:02 AM</span>
            </div>
            <div className="text-sm text-slate-300">
              Can everyone hear me clearly?
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-sm font-semibold text-white">You</span>
              <span className="text-xs text-slate-500">10:03 AM</span>
            </div>
            <div className="text-sm text-slate-300">
              Yes, loud and clear!
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-[#3c4043] bg-[#202124]">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send a message" 
              className="w-full bg-[#3c4043] border border-transparent rounded-full pl-5 pr-12 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors" 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && message.trim()) setMessage('');
              }}
            />
            <button 
              className={`absolute right-2 p-2 rounded-full transition-colors ${message.length > 0 ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-slate-500 cursor-not-allowed'}`}
              onClick={() => setMessage('')}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
