import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../socket.js';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Send, User, X, Copy, Check } from 'lucide-react';

function RemoteVideoPlayer({ stream, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    el.play?.().catch(() => {});
    return () => {
      if (el.srcObject === stream) el.srcObject = null;
    };
  }, [stream]);
  return <video ref={ref} autoPlay playsInline className={className} />;
}

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
  
  // Waiting Room States
  const [isWaiting, setIsWaiting] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [waitingUsers, setWaitingUsers] = useState([]);
  const [joinDenied, setJoinDenied] = useState(false);
  const [roomNotFound, setRoomNotFound] = useState(false);

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
      if (peerConnections.current[targetSocketId]) {
        return peerConnections.current[targetSocketId];
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ],
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', {
            targetSocketId,
            candidate: event.candidate,
            roomId,
          });
        }
      };

      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc-offer', { targetSocketId, offer, roomId });
        } catch (err) {
          console.warn('Negotiation needed failed:', err);
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
        if (pc.connectionState === 'failed') {
          pc.close();
          delete peerConnections.current[targetSocketId];
          setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[targetSocketId];
            return next;
          });
        }
      };

      const stream = mediaStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((track) => {
          // Check if track is already added to avoid duplicates
          const alreadyAdded = pc.getSenders().some(s => s.track === track);
          if (!alreadyAdded) {
            pc.addTrack(track, stream);
          }
        });
      }

      peerConnections.current[targetSocketId] = pc;
      return pc;
    };

    const handleOffer = async (data) => {
      let pc = peerConnections.current[data.socketId];
      if (!pc) {
        pc = createPeerConnection(data.socketId);
      }
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { targetSocketId: data.socketId, answer, roomId });
      } catch (err) {
        console.warn('handleOffer error:', err);
      }
    };

    const handleAnswer = async (data) => {
      const pc = peerConnections.current[data.socketId];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    };

    const handleIceCandidate = async (data) => {
      const pc = peerConnections.current[data.socketId];
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    };

    const onRoomJoined = (data) => {
      setIsWaiting(false);
      setIsHost(data.isHost);
    };

    const onWaitingForHost = () => {
      setIsWaiting(true);
    };

    const onJoinDenied = () => {
      setJoinDenied(true);
    };

    const onRoomNotFound = () => {
      setRoomNotFound(true);
    };

    const onUserWaiting = (data) => {
      setWaitingUsers((prev) => {
        if (prev.some(u => u.socketId === data.socketId)) return prev;
        return [...prev, data];
      });
    };

    const onWaitingUsersList = (list) => {
      setWaitingUsers(list);
    };

    const onUserJoined = (data) => {
      setParticipants((prev) => {
        if (prev.some((p) => p.socketId === data.socketId)) return prev;
        return [...prev, {
          socketId: data.socketId,
          username: data.username,
          audioEnabled: data.audioEnabled !== false,
          videoEnabled: data.videoEnabled !== false
        }];
      });

      setTimeout(() => {
        if (cancelled) return;
        // Create peer connection even if we don't have local media yet
        // so we can at least see/hear others.
        createPeerConnection(data.socketId);
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
          ? list.map((p) => ({ 
              socketId: p.socketId, 
              username: p.username,
              audioEnabled: p.audioEnabled !== false,
              videoEnabled: p.videoEnabled !== false
            }))
          : [];
      setParticipants(mapped);
    };

    const onUserAudioToggled = ({ socketId, enabled }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, audioEnabled: enabled } : p))
      );
    };

    const onUserVideoToggled = ({ socketId, enabled }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, videoEnabled: enabled } : p))
      );
    };

    const onChatMessage = (data) => {
      const socket = getSocket();
      setMessages((prev) => [...prev, { 
        ...data, 
        isOwn: data.socketId === socket.id 
      }]);
    };

    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);
    socket.on('participants-list', onParticipantsList);
    socket.on('chat-message', onChatMessage);
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('user-audio-toggled', onUserAudioToggled);
    socket.on('user-video-toggled', onUserVideoToggled);

    // Waiting room events
    socket.on('room-joined', onRoomJoined);
    socket.on('waiting-for-host', onWaitingForHost);
    socket.on('join-denied', onJoinDenied);
    socket.on('room-not-found', onRoomNotFound);
    socket.on('user-waiting', onUserWaiting);
    socket.on('waiting-users-list', onWaitingUsersList);

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

        const constraintSets = [
          {
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          },
          {
            video: {
              ...(videoDevices[0]?.deviceId ? { deviceId: { exact: videoDevices[0].deviceId } } : {}),
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
            audio: {
              ...(audioDevices[0]?.deviceId ? { deviceId: { exact: audioDevices[0].deviceId } } : {}),
              echoCancellation: true,
              noiseSuppression: true,
            },
          },
          { video: true, audio: true },
          { video: true, audio: false },
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
        const vTracks = stream.getVideoTracks();
        const aTracks = stream.getAudioTracks();
        setIsVideoOff(vTracks.length === 0 ? true : !vTracks[0].enabled);
        setIsMuted(aTracks.length === 0 ? true : !aTracks[0].enabled);
        setLocalStream(stream);

        socket.emit('join-room', {
          roomId,
          username: localStorage.getItem('username') || 'Guest',
          token: localStorage.getItem('token'),
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
      socket.off('user-audio-toggled', onUserAudioToggled);
      socket.off('user-video-toggled', onUserVideoToggled);
      socket.off('room-joined', onRoomJoined);
      socket.off('waiting-for-host', onWaitingForHost);
      socket.off('join-denied', onJoinDenied);
      socket.off('room-not-found', onRoomNotFound);
      socket.off('user-waiting', onUserWaiting);
      socket.off('waiting-users-list', onWaitingUsersList);

      stopLocalMedia();
      closeAllPeers();

      setLocalStream(null);
      setParticipants([]);
      setRemoteStreams({});
    };
  }, [roomId, retryNonce]);

  // Bind MediaStream to <video> after React mounts the element (ref was null during getUserMedia).
  useEffect(() => {
    if (isInitializing || mediaError || !localStream) return;
    const el = localVideoRef.current;
    if (!el) return;
    if (el.srcObject !== localStream) el.srcObject = localStream;
    el.play?.().catch(() => {});
  }, [localStream, isInitializing, mediaError, isVideoOff]);

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
    
    getSocket().emit('toggle-audio', { 
      roomId, 
      userId: getSocket().id, 
      enabled: !nextMuted 
    });
  };

  const toggleVideo = async () => {
    const stream = localStream ?? mediaStreamRef.current;
    
    // If no stream or no video tracks, we need to request them
    if (!stream || stream.getVideoTracks().length === 0) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        const videoTrack = newStream.getVideoTracks()[0];
        
        if (stream) {
          stream.addTrack(videoTrack);
          // Add to all existing peer connections
          Object.values(peerConnections.current).forEach(pc => {
            pc.addTrack(videoTrack, stream);
          });
        } else {
          mediaStreamRef.current = newStream;
          setLocalStream(newStream);
        }
        setIsVideoOff(false);
        getSocket().emit('toggle-video', { roomId, userId: getSocket().id, enabled: true });
      } catch (err) {
        console.error('Failed to get video track:', err);
        setRetryNonce(n => n + 1);
      }
      return;
    }

    const videoTracks = stream.getVideoTracks();
    const nextVideoOff = !isVideoOff;
    videoTracks.forEach((track) => {
      track.enabled = !nextVideoOff;
    });
    setIsVideoOff(nextVideoOff);
    
    getSocket().emit('toggle-video', { 
      roomId, 
      userId: getSocket().id, 
      enabled: !nextVideoOff 
    });
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/meeting/${roomId}`;
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
    setMessage('');
  };

  const handleAdmit = (socketId) => {
    getSocket().emit('admit-user', { roomId, targetSocketId: socketId });
    setWaitingUsers(prev => prev.filter(u => u.socketId !== socketId));
  };

  const handleDeny = (socketId) => {
    getSocket().emit('deny-user', { roomId, targetSocketId: socketId });
    setWaitingUsers(prev => prev.filter(u => u.socketId !== socketId));
  };

  if (joinDenied) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#202124] text-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <X size={32} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold">Entry Denied</h2>
          <p className="text-slate-400">The host declined your request to join.</p>
          <button onClick={onLeave} className="premium-btn bg-white text-slate-900 mt-4 px-6 py-2">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (roomNotFound) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#202124] text-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <X size={32} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold">Room Not Found</h2>
          <p className="text-slate-400">This meeting link is invalid or the meeting was not created.</p>
          <button onClick={onLeave} className="premium-btn bg-white text-slate-900 mt-4 px-6 py-2">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#202124] text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto" />
          <h2 className="text-2xl font-bold">Waiting for Host</h2>
          <p className="text-slate-400">Please wait, the meeting host will let you in soon.</p>
          <button onClick={onLeave} className="text-red-400 hover:text-red-300 mt-6 block mx-auto underline">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const allParticipantsCount = participants.length + 1;
  const getGridClass = () => {
    if (allParticipantsCount === 1) return 'flex items-center justify-center';
    if (allParticipantsCount === 2) return 'grid grid-cols-1 md:grid-cols-2';
    if (allParticipantsCount <= 4) return 'grid grid-cols-1 md:grid-cols-2';
    if (allParticipantsCount <= 6) return 'grid grid-cols-1 md:grid-cols-3';
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#202124] text-white font-sans">

      <div className={`flex-1 flex flex-col transition-all duration-300 relative ${isChatOpen ? 'pr-0 md:pr-80' : 'pr-0'}`}>

        <div className="flex-1 p-4 md:p-6 pb-24 md:pb-28 overflow-y-auto w-full h-full flex items-center justify-center">
          <div className={`${getGridClass()} gap-4 w-full h-full max-w-7xl mx-auto`}>

            <div className={`bg-[#3c4043] rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[220px] border-2 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.3)] group ${allParticipantsCount === 1 ? 'max-w-4xl w-full aspect-video' : ''}`}>
              {isInitializing && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#3c4043]">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400" />
                    <span className="text-indigo-400 text-sm">Initializing camera...</span>
                  </div>
                </div>
              )}
              {!isInitializing && mediaError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-3 p-4 bg-[#3c4043]">
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
              )}

              {localStream && !mediaError && !isInitializing && (
                <>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full min-h-[200px] object-cover ${isVideoOff ? 'opacity-0 absolute inset-0 pointer-events-none' : ''}`}
                    style={{ transform: 'scaleX(-1)' }}
                    onError={() => {
                      console.error('Local video element error');
                      setMediaError('Camera failed to load. Please check permissions.');
                    }}
                  />
                  {isVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#3c4043]">
                      <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <User size={40} className="text-indigo-400" />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-sm font-medium px-3 py-1.5 rounded-lg flex items-center space-x-2 border border-white/10">
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
                  className="bg-[#3c4043] rounded-2xl relative overflow-hidden flex items-center justify-center group border border-white/5 shadow-xl aspect-video"
                >
                  {remoteStream && participant.videoEnabled !== false ? (
                    <RemoteVideoPlayer stream={remoteStream} className="w-full h-full min-h-[200px] object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#3c4043]">
                      <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="text-4xl text-purple-400 font-semibold">
                          {participant.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-sm font-medium px-3 py-1.5 rounded-lg flex items-center space-x-2 border border-white/10">
                    {participant.audioEnabled === false && <MicOff size={14} className="text-red-400" />}
                    <span>{participant.username || 'User'}</span>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {isHost && waitingUsers.length > 0 && (
          <div className="absolute top-20 right-6 z-50 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <span className="bg-indigo-500 text-xs px-2 py-0.5 rounded-full mr-2">{waitingUsers.length}</span>
              Waiting to join
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {waitingUsers.map(user => (
                <div key={user.socketId} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                  <span className="text-sm font-medium text-slate-200 truncate pr-2">{user.username}</span>
                  <div className="flex space-x-2">
                    <button onClick={() => handleDeny(user.socketId)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors">
                      <X size={16} />
                    </button>
                    <button onClick={() => handleAdmit(user.socketId)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors">
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
