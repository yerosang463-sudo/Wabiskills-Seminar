import { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Info, Send, User, X } from 'lucide-react';

export default function MeetingRoom({ onNavigate }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#202124] text-white font-sans">
      
      {/* 1. MAIN VIDEO AREA */}
      <div className={`flex-1 flex flex-col transition-all duration-300 relative ${isChatOpen ? 'pr-80' : 'pr-0'}`}>
        
        {/* Top Info Bar (Floating) */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <div className="pointer-events-auto flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10">
            <Info size={16} className="text-slate-300" />
            <span className="text-sm font-medium text-white">WabiSeminar Design Review</span>
          </div>
        </div>

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

        {/* BOTTOM CONTROL BAR (Floating like Google Meet) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-[#3c4043]/90 backdrop-blur-xl px-6 py-3 rounded-2xl flex items-center space-x-4 border border-white/10 shadow-2xl">
            
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

            <div className="w-px h-8 bg-white/20 mx-2"></div>

            <button 
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isChatOpen ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[#4a4d51] hover:bg-[#5f6368] text-white'}`}
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <MessageSquare size={20} />
            </button>

            <button 
              className="w-16 h-12 rounded-full flex items-center justify-center bg-[#ea4335] text-white hover:bg-[#d93025] transition-all shadow-lg shadow-red-500/30 ml-4"
              onClick={() => onNavigate('dashboard')}
            >
              <PhoneOff size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. RIGHT CHAT PANEL (Google Meet Style) */}
      <div className={`
        fixed md:absolute right-0 top-0 bottom-0 w-full md:w-80 bg-white dark:bg-[#202124] md:border-l border-[#3c4043] flex flex-col z-30 transition-transform duration-300 shadow-2xl md:shadow-none
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
              placeholder="Send a message to everyone" 
              className="w-full bg-[#3c4043] border border-transparent rounded-full pl-5 pr-12 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors" 
            />
            <button className={`absolute right-2 p-2 rounded-full transition-colors ${message.length > 0 ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-slate-500 cursor-not-allowed'}`}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
