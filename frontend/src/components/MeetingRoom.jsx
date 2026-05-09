import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Send, User, X, Copy, Check } from 'lucide-react';

const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://wabiskills-seminar.onrender.com', {
  transports: ['websocket', 'polling']
});

export default function MeetingRoom({ onLeave, roomId }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [messages, setMessages] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [mediaError, setMediaError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  
  const localVideoRef = useRef(null);
  const peerConnections = useRef({});
  const messagesEndRef = useRef(null);

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

  // Initialize media and socket
  useEffect(() => {
    const initMedia = async () => {
      try {
        setIsInitializing(true);
        setMediaError('');
        
        // Request media permissions
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        setLocalStream(stream);
        
        // Set video element source
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          // Wait for video to be ready
          await localVideoRef.current.play();
        }
        
        console.log('Media initialized successfully');
      } catch (err) {
        console.error('Error accessing media devices:', err);
        let errorMessage = 'Failed to access camera/microphone';
        
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera/microphone permission denied. Please allow access in your browser settings.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found. Please connect a device.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        }
        
        setMediaError(errorMessage);
      } finally {
        setIsInitializing(false);
      }
    };

    initMedia();

    // Connect to room
    if (roomId) {
      socket.emit('join-room', { roomId, username: localStorage.getItem('username') || 'Guest' });
    }

    // Socket event listeners
    socket.on('user-joined', (data) => {
      console.log('User joined:', data);
      setParticipants((prev) => [...prev, data]);
      
      // Create and send offer to new participant
      setTimeout(() => {
        const pc = createPeerConnection(data.socketId);
        pc.createOffer().then(offer => {
          pc.setLocalDescription(offer);
          socket.emit('webrtc-offer', {
            targetSocketId: data.socketId,
            offer,
            roomId
          });
        });
      }, 1000);
    });

    socket.on('user-left', (data) => {
      console.log('User left:', data);
      setParticipants((prev) => prev.filter((p) => p.socketId !== data.socketId));
      
      // Clean up peer connection and remote stream
      if (peerConnections.current[data.socketId]) {
        peerConnections.current[data.socketId].close();
        delete peerConnections.current[data.socketId];
      }
      setRemoteStreams(prev => {
        const newStreams = { ...prev };
        delete newStreams[data.socketId];
        return newStreams;
      });
    });

    socket.on('chat-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('webrtc-offer', async (data) => {
      handleOffer(data);
    });

    socket.on('webrtc-answer', async (data) => {
      handleAnswer(data);
    });

    socket.on('webrtc-ice-candidate', async (data) => {
      handleIceCandidate(data);
    });

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      socket.disconnect();
    };
  }, [roomId]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebRTC functions
  const createPeerConnection = (targetSocketId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice-candidate', {
          targetSocketId,
          candidate: event.candidate,
          roomId
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track from', targetSocketId);
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => ({
        ...prev,
        [targetSocketId]: remoteStream
      }));
    };

    peerConnections.current[targetSocketId] = pc;
    return pc;
  };

  const handleOffer = async (data) => {
    console.log('Handling offer from', data.socketId);
    const pc = createPeerConnection(data.socketId);
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('webrtc-answer', { targetSocketId: data.socketId, answer, roomId });
  };

  const handleAnswer = async (data) => {
    const pc = peerConnections.current[data.socketId];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  };

  const handleIceCandidate = async (data) => {
    const pc = peerConnections.current[data.socketId];
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const msgData = {
        message: message.trim(),
        username: localStorage.getItem('username') || 'Guest',
        roomId,
        timestamp: new Date().toISOString()
      };
      socket.emit('chat-message', msgData);
      setMessages((prev) => [...prev, { ...msgData, isOwn: true }]);
      setMessage('');
    }
  };

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#202124] text-white font-sans">
      
      {/* 1. MAIN VIDEO AREA */}
      <div className={`flex-1 flex flex-col transition-all duration-300 relative ${isChatOpen ? 'pr-0 md:pr-80' : 'pr-0'}`}>
        
        {/* Video Grid */}
        <div className="flex-1 p-4 md:p-6 pb-24 md:pb-28 overflow-y-auto w-full h-full flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full max-w-7xl max-h-[800px]">
            
            {/* You (Local Video) */}
            <div className="bg-[#3c4043] rounded-2xl relative overflow-hidden flex items-center justify-center border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)] group">
              {isInitializing ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
                  <span className="text-indigo-400 text-sm">Initializing camera...</span>
                </div>
              ) : mediaError ? (
                <div className="flex flex-col items-center justify-center space-y-3 p-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <VideoOff size={32} className="text-red-400" />
                  </div>
                  <span className="text-red-400 text-sm text-center">{mediaError}</span>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : isVideoOff || !localStream ? (
                <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <User size={40} className="text-indigo-400" />
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }} // Mirror effect for local video
                />
              )}
              
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-sm font-medium px-3 py-1.5 rounded-lg flex items-center space-x-2">
                {isMuted && <MicOff size={14} className="text-red-400" />}
                <span>You</span>
              </div>
              
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/50">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Remote Participants */}
            {participants.map((participant) => {
              const remoteStream = remoteStreams[participant.socketId];
              return (
                <div key={participant.socketId} className="bg-[#3c4043] rounded-2xl relative overflow-hidden flex items-center justify-center group border border-transparent">
                  {remoteStream ? (
                    <video
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                      ref={(videoEl) => {
                        if (videoEl && videoEl.srcObject !== remoteStream) {
                          videoEl.srcObject = remoteStream;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-4xl text-purple-400 font-semibold">
                        {participant.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-sm font-medium px-3 py-1.5 rounded-lg">
                    <span>{participant.username || 'User'}</span>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* BOTTOM LEFT INFO (Google Meet Style) */}
        <div className="absolute bottom-6 left-6 z-20 flex items-center text-white pointer-events-auto">
          <span className="text-[15px] font-medium mr-4">{currentTime}</span>
          <div className="w-px h-4 bg-white/30 mr-4 hidden sm:block"></div>
          <span className="text-[15px] font-medium hidden sm:block mr-4">WabiSeminar Meeting</span>
          <div className="w-px h-4 bg-white/30 mr-4 hidden sm:block"></div>
          <span className="text-[15px] font-mono mr-2">{roomId || 'xyz-abcd-efg'}</span>
          <button 
            onClick={handleCopyLink}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white relative group"
            title="Copy Room Link"
          >
            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {copied ? 'Link copied!' : 'Copy meeting link'}
            </div>
          </button>
        </div>

        {/* BOTTOM CONTROL BAR (Floating Center) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-[#3c4043] px-6 py-3 rounded-full flex items-center space-x-4 shadow-xl">
            
            <button 
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isMuted ? 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-lg shadow-red-500/20' : 'bg-[#4a4d51] hover:bg-[#5f6368] text-white'}`}
              onClick={toggleMute}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button 
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isVideoOff ? 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-lg shadow-red-500/20' : 'bg-[#4a4d51] hover:bg-[#5f6368] text-white'}`}
              onClick={toggleVideo}
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

      {/* RIGHT CHAT PANEL (Google Meet Style) */}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 text-sm mt-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex flex-col space-y-1 ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline space-x-2">
                  <span className="text-sm font-semibold text-white">{msg.username}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`text-sm p-2 rounded-lg max-w-[80%] ${msg.isOwn ? 'bg-indigo-500/20 text-indigo-200' : 'bg-[#3c4043] text-slate-300'}`}>
                  {msg.message}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
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
                if (e.key === 'Enter' && message.trim()) handleSendMessage();
              }}
            />
            <button 
              className={`absolute right-2 p-2 rounded-full transition-colors ${message.length > 0 ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-slate-500 cursor-not-allowed'}`}
              onClick={handleSendMessage}
              disabled={message.length === 0}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
