import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../socket.js';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Send, User, X, Copy, Check } from 'lucide-react';

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
  const [retryNonce, setRetryNonce] = useState(0);

  const localVideoRef = useRef(null);
  const peerConnections = useRef({});
  const messagesEndRef = useRef(null);
  const mediaStreamRef = useRef(null);

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

  useEffect(() => {
    if (!roomId) return undefined;

    const socket = getSocket();
    let cancelled = false;

    const closeAllPeers = () => {
      Object.values(peerConnections.current).forEach((pc) => {
        try {
          pc.close();
        } catch (_) {
          /* noop */
        }
      });
      peerConnections.current = {};
    };

    const stopLocalMedia = () => {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    };

    const createPeerConnection = (targetSocketId) => {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ],
      });

      const stream = mediaStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', {
            targetSocketId,
            candidate: event.candidate,
            roomId,
          });
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStreams((prev) => ({
          ...prev,
          [targetSocketId]: remoteStream,
        }));
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          pc.close();
          delete peerConnections.current[targetSocketId];
          setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[targetSocketId];
            return next;
          });
        }
      };

      peerConnections.current[targetSocketId] = pc;
      return pc;
    };

    const handleOffer = async (data) => {
      const pc = createPeerConnection(data.socketId);
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc-answer', { targetSocketId: data.socketId, answer, roomId });
    };

    const handleAnswer = async (data) => {
      const pc = peerConnections.current[data.socketId];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    };

    const handleIceCandidate = async (data) => {
      const pc = peerConnections.current[data.socketId];
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    };

    const onUserJoined = (data) => {
      setParticipants((prev) => {
        if (prev.some((p) => p.socketId === data.socketId)) return prev;
        return [...prev, data];
      });

      setTimeout(() => {
        if (cancelled || !mediaStreamRef.current) return;
        const pc = createPeerConnection(data.socketId);
        pc.createOffer().then((offer) => {
          pc.setLocalDescription(offer);
          socket.emit('webrtc-offer', {
            targetSocketId: data.socketId,
            offer,
            roomId,
          });
        });
      }, 500);
    };

    const onUserLeft = (data) => {
      setParticipants((prev) => prev.filter((p) => p.socketId !== data.socketId));
      if (peerConnections.current[data.socketId]) {
        peerConnections.current[data.socketId].close();
        delete peerConnections.current[data.socketId];
      }
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[data.socketId];
        return next;
      });
    };

    const onParticipantsList = (list) => {
      const mapped =
        Array.isArray(list) && list.length > 0
          ? list.map((p) => ({ socketId: p.socketId, username: p.username }))
          : [];
      setParticipants(mapped);
    };

    const onChatMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);
    socket.on('participants-list', onParticipantsList);
    socket.on('chat-message', onChatMessage);
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);

    async function acquireMediaThenJoin() {
      try {
        setIsInitializing(true);
        setMediaError('');

        stopLocalMedia();
        closeAllPeers();
        setRemoteStreams({});

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        const audioDevices = devices.filter((d) => d.kind === 'audioinput');

        if (videoDevices.length === 0) {
          if (!cancelled) {
            setMediaError('No camera found. Please connect a camera device.');
            setLocalStream(null);
          }
          return;
        }

        if (audioDevices.length === 0) {
          if (!cancelled) {
            setMediaError('No microphone found. Please connect a microphone.');
            setLocalStream(null);
          }
          return;
        }

        const constraintSets = [
          {
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          },
          {
            video: {
              deviceId: videoDevices[0]?.deviceId,
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
            audio: {
              deviceId: audioDevices[0]?.deviceId,
              echoCancellation: true,
              noiseSuppression: true,
            },
          },
          { video: true, audio: true },
        ];

        let stream = null;
        let lastMediaErr = null;
        for (const c of constraintSets) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(c);
            break;
          } catch (err) {
            lastMediaErr = err;
            console.warn('getUserMedia attempt failed:', err?.name || err);
          }
        }

        if (!stream && lastMediaErr) throw lastMediaErr;
        if (!stream) throw new Error('getUserMedia failed');

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;
        setLocalStream(stream);

        const el = localVideoRef.current;
        if (el) {
          el.srcObject = stream;
          el.play().catch((e) => console.warn('Local video play:', e));
        }

        socket.emit('join-room', {
          roomId,
          username: localStorage.getItem('username') || 'Guest',
        });
      } catch (err) {
        console.error('Error accessing media devices:', err);
        let errorMessage = 'Failed to access camera/microphone';
        if (err?.name === 'NotAllowedError') {
          errorMessage =
            'Camera/microphone permission denied. Please allow access in your browser settings and refresh the page.';
        } else if (err?.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found. Please connect a device.';
        } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
          errorMessage =
            'Camera is already in use. Close other tabs using it (or apps like Zoom), then Retry.';
        } else if (err?.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints cannot be satisfied. Try again with default settings.';
        }
        if (!cancelled) {
          setMediaError(errorMessage);
          setLocalStream(null);
        }
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    }

    acquireMediaThenJoin();

    return () => {
      cancelled = true;

      socket.emit('leave-room', { roomId });

      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
      socket.off('participants-list', onParticipantsList);
      socket.off('chat-message', onChatMessage);
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);

      stopLocalMedia();
      closeAllPeers();

      setLocalStream(null);
      setParticipants([]);
      setRemoteStreams({});
    };
  }, [roomId, retryNonce]);

  // Scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleMute = () => {
    const stream = localStream ?? mediaStreamRef.current;
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;
    const nextMuted = !isMuted;
    audioTracks.forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
  };

  const toggleVideo = () => {
    const stream = localStream ?? mediaStreamRef.current;
    if (!stream) {
      setRetryNonce((n) => n + 1);
      return;
    }
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) return;
    const nextVideoOff = !isVideoOff;
    videoTracks.forEach((track) => {
      track.enabled = !nextVideoOff;
    });
    setIsVideoOff(nextVideoOff);
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
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

  const handleRetryCamera = async () => {
    setRetryNonce((n) => n + 1);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const socket = getSocket();
    const msgData = {
      message: message.trim(),
      username: localStorage.getItem('username') || 'Guest',
      roomId,
      timestamp: new Date().toISOString(),
    };
    socket.emit('chat-message', msgData);
    setMessages((prev) => [...prev, { ...msgData, isOwn: true }]);
    setMessage('');
  };

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#202124] text-white font-sans">

      <div className={`flex-1 flex flex-col transition-all duration-300 relative ${isChatOpen ? 'pr-0 md:pr-80' : 'pr-0'}`}>

        <div className="flex-1 p-4 md:p-6 pb-24 md:pb-28 overflow-y-auto w-full h-full flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full max-w-7xl max-h-[800px]">

            <div className="bg-[#3c4043] rounded-2xl relative overflow-hidden flex items-center justify-center border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)] group">
              {isInitializing ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400" />
                  <span className="text-indigo-400 text-sm">Initializing camera...</span>
                </div>
              ) : mediaError ? (
                <div className="flex flex-col items-center justify-center space-y-3 p-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <VideoOff size={32} className="text-red-400" />
                  </div>
                  <span className="text-red-400 text-sm text-center">{mediaError}</span>
                  <button
                    type="button"
                    onClick={handleRetryCamera}
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
                  style={{ transform: 'scaleX(-1)' }}
                  onError={(e) => {
                    console.error('Local video error:', e);
                    setMediaError('Camera failed to load. Please check permissions.');
                  }}
                />
              )}

              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-sm font-medium px-3 py-1.5 rounded-lg flex items-center space-x-2">
                {isMuted && <MicOff size={14} className="text-red-400" />}
                <span>You</span>
              </div>

              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/50">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>

            {participants.map((participant) => {
              const remoteStream = remoteStreams[participant.socketId];
              return (
                <div
                  key={participant.socketId}
                  className="bg-[#3c4043] rounded-2xl relative overflow-hidden flex items-center justify-center group border border-transparent"
                >
                  {remoteStream ? (
                    <video
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                      ref={(videoEl) => {
                        if (videoEl && videoEl.srcObject !== remoteStream) {
                          videoEl.srcObject = remoteStream;
                          videoEl.play().catch((e2) => console.warn('Remote play:', e2));
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

        <div className="absolute bottom-6 left-6 z-20 flex items-center text-white pointer-events-auto">
          <span className="text-[15px] font-medium mr-4">{currentTime}</span>
          <div className="w-px h-4 bg-white/30 mr-4 hidden sm:block" />
          <span className="text-[15px] font-medium hidden sm:block mr-4">WabiSeminar Meeting</span>
          <div className="w-px h-4 bg-white/30 mr-4 hidden sm:block" />
          <span className="text-[15px] font-mono mr-2">{roomId || 'xyz-abcd-efg'}</span>
          <button
            type="button"
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

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-[#3c4043] px-6 py-3 rounded-full flex items-center space-x-4 shadow-xl">

            <button
              type="button"
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isMuted ? 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-lg shadow-red-500/20' : 'bg-[#4a4d51] hover:bg-[#5f6368] text-white'}`}
              onClick={toggleMute}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              type="button"
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isVideoOff ? 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-lg shadow-red-500/20' : 'bg-[#4a4d51] hover:bg-[#5f6368] text-white'}`}
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            <button
              type="button"
              className="w-16 h-12 rounded-[24px] flex items-center justify-center bg-[#ea4335] text-white hover:bg-[#d93025] transition-all shadow-lg shadow-red-500/30 ml-2"
              onClick={onLeave}
            >
              <PhoneOff size={22} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 z-20">
          <button
            type="button"
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${isChatOpen ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[#3c4043] hover:bg-[#4a4d51] text-white'}`}
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageSquare size={20} />
          </button>
        </div>

      </div>

      <div
        className={`
        fixed md:absolute right-0 top-0 bottom-0 w-full md:w-80 bg-[#202124] md:border-l border-[#3c4043] flex flex-col z-30 transition-transform duration-300 shadow-2xl md:shadow-none
        ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#3c4043]">
          <span className="text-lg font-medium text-white">In-call messages</span>
          <button
            type="button"
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
            onClick={() => setIsChatOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-indigo-500/10 p-4 text-sm text-indigo-200 border-b border-indigo-500/20 leading-relaxed">
          Messages can only be seen by people in the call and are deleted when the call ends.
        </div>

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
                <div
                  className={`text-sm p-2 rounded-lg max-w-[80%] ${msg.isOwn ? 'bg-indigo-500/20 text-indigo-200' : 'bg-[#3c4043] text-slate-300'}`}
                >
                  {msg.message}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

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
              type="button"
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
