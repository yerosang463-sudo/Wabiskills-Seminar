import { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Send } from 'lucide-react';

export default function MeetingRoom({ onNavigate }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpenMobile, setIsChatOpenMobile] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-100">
      
      {/* Top Mobile Bar (for toggling chat on mobile) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="font-medium text-gray-800 text-sm">Meeting Room</div>
        <button 
          className="p-2 bg-gray-100 rounded-md text-gray-600"
          onClick={() => setIsChatOpenMobile(!isChatOpenMobile)}
        >
          <MessageSquare size={18} />
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {/* 1. VIDEO GRID */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full auto-rows-fr">
            {/* User 1 */}
            <div className="bg-gray-300 rounded-lg relative overflow-hidden flex items-center justify-center min-h-[200px]">
              <div className="text-gray-500 font-medium">Video Placeholder</div>
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                You
              </div>
            </div>
            {/* User 2 */}
            <div className="bg-gray-300 rounded-lg relative overflow-hidden flex items-center justify-center min-h-[200px]">
              <div className="text-gray-500 font-medium">Video Placeholder</div>
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                User 2
              </div>
            </div>
            {/* User 3 */}
            <div className="bg-gray-300 rounded-lg relative overflow-hidden flex items-center justify-center min-h-[200px]">
              <div className="text-gray-500 font-medium">Video Placeholder</div>
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                User 3
              </div>
            </div>
            {/* User 4 */}
            <div className="bg-gray-300 rounded-lg relative overflow-hidden flex items-center justify-center min-h-[200px]">
              <div className="text-gray-500 font-medium">Video Placeholder</div>
              <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                User 4
              </div>
            </div>
          </div>
        </div>

        {/* 2. CHAT PANEL */}
        <div className={`
          absolute md:relative right-0 top-0 bottom-0 w-full md:w-80 bg-white border-l border-gray-200 flex flex-col z-10 transition-transform duration-300
          ${isChatOpenMobile ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
          <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4">
            <span className="font-medium text-gray-800">Chat</span>
            <button 
              className="md:hidden text-gray-500 text-sm"
              onClick={() => setIsChatOpenMobile(false)}
            >
              Close
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-800 mb-0.5">User 1</span>
              <div className="bg-gray-100 rounded-lg rounded-tl-none p-2.5 text-sm text-gray-800 w-fit">
                Hello
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-gray-800 mb-0.5">You</span>
              <div className="bg-gray-800 text-white rounded-lg rounded-tr-none p-2.5 text-sm w-fit">
                Hi
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input type="text" placeholder="Type message..." className="wf-input flex-1" />
              <button className="wf-btn wf-btn-primary px-3">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 3. CONTROL BAR */}
      <div className="h-20 bg-white border-t border-gray-200 flex items-center justify-center space-x-4 px-4 pb-safe">
        <button 
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        
        <button 
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setIsVideoOff(!isVideoOff)}
        >
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>

        <button 
          className="w-16 h-12 rounded-full flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-colors"
          onClick={() => onNavigate('dashboard')}
        >
          <PhoneOff size={20} />
        </button>
      </div>

    </div>
  );
}
