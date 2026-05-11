import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../socket.js';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Send, User, X, Copy, Check } from 'lucide-react';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

function RemoteVideoPlayer({ stream, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !stream) return undefined;

    el.srcObject = stream;
    el.play?.().catch(() => {});

    return () => {
      if (el.srcObject === stream) el.srcObject = null;
    };
  }, [stream]);

  return <video ref={ref} autoPlay playsInline className={className} />;
}

function addStreamTracksToPeer(pc, stream) {
  stream.getTracks().forEach((track) => {
    const alreadyAdded = pc.getSenders().some((sender) => sender.track?.id === track.id);
    if (!alreadyAdded) {
      pc.addTrack(track, stream);
    }
  });
}

function normalizeParticipants(list, selfSocketId) {
  if (!Array.isArray(list)) return [];

  return list
    .filter((participant) => participant.socketId && participant.socketId !== selfSocketId)
    .map((participant) => ({
      socketId: participant.socketId,
      username: participant.username || 'User',
      audioEnabled: participant.audioEnabled !== false,
      videoEnabled: participant.videoEnabled !== false,
      isHost: Boolean(participant.isHost),
    }));
}

export default function MeetingRoom({ onLeave, roomId, notify }) {
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
  const [isInitializing, setIsInitializing] = useState(false);
  const [isJoining, setIsJoining] = useState(true);

  const [isWaiting, setIsWaiting] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [waitingUsers, setWaitingUsers] = useState([]);
  const [joinDenied, setJoinDenied] = useState(false);
  const [roomNotFound, setRoomNotFound] = useState(false);

  const localVideoRef = useRef(null);
  const peerConnections = useRef({});
  const pendingCandidates = useRef({});
  const messagesEndRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const acquireMediaRef = useRef(null);

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

    const closePeer = (socketId) => {
      const state = peerConnections.current[socketId];
      if (state?.pc) {
        try {
          state.pc.close();
        } catch {
          // noop
        }
      }

      delete peerConnections.current[socketId];
      delete pendingCandidates.current[socketId];
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    const closeAllPeers = () => {
      Object.keys(peerConnections.current).forEach(closePeer);
      peerConnections.current = {};
      pendingCandidates.current = {};
    };

    const stopLocalMedia = () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      setLocalStream(null);
    };

    const addLocalTracksToAllPeers = (stream) => {
      Object.values(peerConnections.current).forEach(({ pc }) => addStreamTracksToPeer(pc, stream));
    };

    const flushPendingCandidates = async (socketId) => {
      const state = peerConnections.current[socketId];
      const queued = pendingCandidates.current[socketId] || [];
      if (!state?.pc?.remoteDescription || queued.length === 0) return;

      pendingCandidates.current[socketId] = [];
      for (const candidate of queued) {
        try {
          await state.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          if (!state.ignoreOffer) console.warn('Failed to add queued ICE candidate:', err);
        }
      }
    };

    const createPeerConnection = (targetSocketId) => {
      if (!targetSocketId || targetSocketId === socket.id) return null;
      if (peerConnections.current[targetSocketId]) return peerConnections.current[targetSocketId];

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      const state = {
        pc,
        makingOffer: false,
        ignoreOffer: false,
        polite: String(socket.id || '') > String(targetSocketId),
      };

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
          state.makingOffer = true;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc-offer', {
            targetSocketId,
            offer: pc.localDescription,
            roomId,
          });
        } catch (err) {
          console.warn('WebRTC negotiation failed:', err);
        } finally {
          state.makingOffer = false;
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (!remoteStream) return;

        setRemoteStreams((prev) => ({
          ...prev,
          [targetSocketId]: remoteStream,
        }));
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          closePeer(targetSocketId);
        }
      };

      const stream = mediaStreamRef.current;
      if (stream) addStreamTracksToPeer(pc, stream);

      peerConnections.current[targetSocketId] = state;
      return state;
    };

    const acquireLocalMedia = async () => {
      if (mediaStreamRef.current) return mediaStreamRef.current;

      try {
        setIsInitializing(true);
        setMediaError('');

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === 'videoinput');
        const audioDevices = devices.filter((device) => device.kind === 'audioinput');

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
        for (const constraints of constraintSets) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            break;
          } catch (err) {
            lastMediaErr = err;
            console.warn('getUserMedia attempt failed:', err?.name || err);
          }
        }

        if (!stream && lastMediaErr) throw lastMediaErr;
        if (!stream) throw new Error('getUserMedia failed');

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return null;
        }

        mediaStreamRef.current = stream;
        setLocalStream(stream);
        setIsVideoOff(stream.getVideoTracks().length === 0 || !stream.getVideoTracks()[0].enabled);
        setIsMuted(stream.getAudioTracks().length === 0 || !stream.getAudioTracks()[0].enabled);
        addLocalTracksToAllPeers(stream);
        return stream;
      } catch (err) {
        console.error('Error accessing media devices:', err);
        let errorMessage = 'Failed to access camera/microphone.';
        if (err?.name === 'NotAllowedError') {
          errorMessage = 'Camera/microphone permission denied. Please allow access in your browser settings and retry.';
        } else if (err?.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found. You can still stay in the meeting.';
        } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
          errorMessage = 'Camera is already in use. Close other apps or tabs using it, then retry.';
        } else if (err?.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints cannot be satisfied. Try again with default settings.';
        }

        if (!cancelled) {
          setMediaError(errorMessage);
          setLocalStream(null);
          notify?.('error', errorMessage);
        }

        return null;
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    };
    acquireMediaRef.current = acquireLocalMedia;

    const syncParticipants = (list) => {
      const mapped = normalizeParticipants(list, socket.id);
      setParticipants(mapped);

      const liveSocketIds = new Set(mapped.map((participant) => participant.socketId));
      mapped.forEach((participant) => createPeerConnection(participant.socketId));

      Object.keys(peerConnections.current).forEach((socketId) => {
        if (!liveSocketIds.has(socketId)) closePeer(socketId);
      });
    };

    const requestJoin = () => {
      setIsJoining(true);
      socket.emit('join-room', {
        roomId,
        username: localStorage.getItem('username') || 'Guest',
        token: localStorage.getItem('token'),
      });
    };

    const handleOffer = async (data) => {
      const state = createPeerConnection(data.socketId);
      if (!state) return;

      const { pc } = state;
      const offerCollision = state.makingOffer || pc.signalingState !== 'stable';
      state.ignoreOffer = !state.polite && offerCollision;

      if (state.ignoreOffer) return;

      try {
        if (offerCollision) {
          await pc.setLocalDescription({ type: 'rollback' });
        }

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        if (mediaStreamRef.current) addStreamTracksToPeer(pc, mediaStreamRef.current);
        await flushPendingCandidates(data.socketId);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', {
          targetSocketId: data.socketId,
          answer: pc.localDescription,
          roomId,
        });
      } catch (err) {
        console.warn('Failed to handle WebRTC offer:', err);
      }
    };

    const handleAnswer = async (data) => {
      const state = peerConnections.current[data.socketId];
      if (!state?.pc) return;

      try {
        if (state.pc.signalingState === 'have-local-offer') {
          await state.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          await flushPendingCandidates(data.socketId);
        }
      } catch (err) {
        console.warn('Failed to handle WebRTC answer:', err);
      }
    };

    const handleIceCandidate = async (data) => {
      const state = createPeerConnection(data.socketId);
      if (!state?.pc || !data.candidate) return;

      if (!state.pc.remoteDescription) {
        pendingCandidates.current[data.socketId] = pendingCandidates.current[data.socketId] || [];
        pendingCandidates.current[data.socketId].push(data.candidate);
        return;
      }

      try {
        await state.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        if (!state.ignoreOffer) console.warn('Failed to add ICE candidate:', err);
      }
    };

    const onRoomJoined = (data) => {
      setIsJoining(false);
      setIsWaiting(false);
      setJoinDenied(false);
      setRoomNotFound(false);
      setIsHost(Boolean(data.isHost));
      syncParticipants(data.participants || []);
      acquireLocalMedia();
    };

    const onWaitingForHost = () => {
      setIsJoining(false);
      setIsWaiting(true);
      setIsHost(false);
      setIsInitializing(false);
    };

    const onJoinDenied = () => {
      setIsJoining(false);
      setIsWaiting(false);
      setJoinDenied(true);
      stopLocalMedia();
      closeAllPeers();
      notify?.('error', 'The host declined your request to join.');
    };

    const onRoomNotFound = () => {
      setIsJoining(false);
      setIsWaiting(false);
      setRoomNotFound(true);
      stopLocalMedia();
      closeAllPeers();
      notify?.('error', 'This meeting link is invalid or has ended.');
    };

    const onUserWaiting = (data) => {
      if (!data?.socketId) return;
      setWaitingUsers((prev) => {
        if (prev.some((user) => user.socketId === data.socketId)) return prev;
        return [...prev, data];
      });
      notify?.('success', `${data.username || 'A participant'} wants to join.`);
    };

    const onWaitingUsersList = (list) => {
      setWaitingUsers(Array.isArray(list) ? list : []);
    };

    const onUserJoined = (data) => {
      if (!data?.socketId || data.socketId === socket.id) return;

      setParticipants((prev) => {
        if (prev.some((participant) => participant.socketId === data.socketId)) return prev;
        return [
          ...prev,
          {
            socketId: data.socketId,
            username: data.username || 'User',
            audioEnabled: data.audioEnabled !== false,
            videoEnabled: data.videoEnabled !== false,
            isHost: Boolean(data.isHost),
          },
        ];
      });
      createPeerConnection(data.socketId);
    };

    const onUserLeft = (data) => {
      setParticipants((prev) => prev.filter((participant) => participant.socketId !== data.socketId));
      closePeer(data.socketId);
    };

    const onParticipantsList = (list) => {
      syncParticipants(list);
    };

    const onUserAudioToggled = ({ socketId, enabled }) => {
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.socketId === socketId ? { ...participant, audioEnabled: enabled } : participant
        )
      );
    };

    const onUserVideoToggled = ({ socketId, enabled }) => {
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.socketId === socketId ? { ...participant, videoEnabled: enabled } : participant
        )
      );
    };

    const onChatMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          isOwn: data.socketId === socket.id,
        },
      ]);
    };

    const onRoomError = (data) => {
      const message = data?.message || 'Meeting connection failed.';
      setIsJoining(false);
      setMediaError(message);
      notify?.('error', message);
    };

    socket.on('connect', requestJoin);
    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);
    socket.on('participants-list', onParticipantsList);
    socket.on('chat-message', onChatMessage);
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('user-audio-toggled', onUserAudioToggled);
    socket.on('user-video-toggled', onUserVideoToggled);
    socket.on('room-joined', onRoomJoined);
    socket.on('waiting-for-host', onWaitingForHost);
    socket.on('join-denied', onJoinDenied);
    socket.on('room-not-found', onRoomNotFound);
    socket.on('user-waiting', onUserWaiting);
    socket.on('waiting-users-list', onWaitingUsersList);
    socket.on('room-error', onRoomError);
    socket.on('admission-error', onRoomError);

    requestJoin();

    return () => {
      cancelled = true;
      socket.emit('leave-room', { roomId });

      socket.off('connect', requestJoin);
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
      socket.off('room-error', onRoomError);
      socket.off('admission-error', onRoomError);

      stopLocalMedia();
      closeAllPeers();
      setParticipants([]);
      setWaitingUsers([]);
      setRemoteStreams({});
      setMessages([]);
      acquireMediaRef.current = null;
    };
  }, [roomId, notify]);

  useEffect(() => {
    if (isInitializing || mediaError || !localStream) return;
    const el = localVideoRef.current;
    if (!el) return;

    if (el.srcObject !== localStream) el.srcObject = localStream;
    el.play?.().catch(() => {});
  }, [localStream, isInitializing, mediaError, isVideoOff]);

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
    getSocket().emit('toggle-audio', { roomId, enabled: !nextMuted });
  };

  const toggleVideo = async () => {
    const stream = localStream ?? mediaStreamRef.current;

    if (!stream || stream.getVideoTracks().length === 0) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        const videoTrack = newStream.getVideoTracks()[0];

        if (stream) {
          stream.addTrack(videoTrack);
          Object.values(peerConnections.current).forEach(({ pc }) => {
            const alreadyAdded = pc.getSenders().some((sender) => sender.track?.id === videoTrack.id);
            if (!alreadyAdded) pc.addTrack(videoTrack, stream);
          });
        } else {
          mediaStreamRef.current = newStream;
          setLocalStream(newStream);
          Object.values(peerConnections.current).forEach(({ pc }) => addStreamTracksToPeer(pc, newStream));
        }

        setMediaError('');
        setIsVideoOff(false);
        getSocket().emit('toggle-video', { roomId, enabled: true });
      } catch (err) {
        console.error('Failed to get video track:', err);
        notify?.('error', 'Could not turn camera on. Check browser permissions.');
      }
      return;
    }

    const videoTracks = stream.getVideoTracks();
    const nextVideoOff = !isVideoOff;
    videoTracks.forEach((track) => {
      track.enabled = !nextVideoOff;
    });
    setIsVideoOff(nextVideoOff);
    getSocket().emit('toggle-video', { roomId, enabled: !nextVideoOff });
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/meeting/${roomId}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        setCopied(true);
        notify?.('success', 'Meeting link copied.');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = fullUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        notify?.('success', 'Meeting link copied.');
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const handleRetryCamera = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setLocalStream(null);
    setMediaError('');
    acquireMediaRef.current?.();
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    getSocket().emit('chat-message', {
      message: message.trim(),
      username: localStorage.getItem('username') || 'Guest',
      roomId,
      timestamp: new Date().toISOString(),
    });
    setMessage('');
  };

  const handleAdmit = (socketId) => {
    getSocket().emit('admit-user', { roomId, targetSocketId: socketId });
    setWaitingUsers((prev) => prev.filter((user) => user.socketId !== socketId));
  };

  const handleDeny = (socketId) => {
    getSocket().emit('deny-user', { roomId, targetSocketId: socketId });
    setWaitingUsers((prev) => prev.filter((user) => user.socketId !== socketId));
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
          <button type="button" onClick={onLeave} className="premium-btn bg-white text-slate-900 mt-4 px-6 py-2">
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
          <button type="button" onClick={onLeave} className="premium-btn bg-white text-slate-900 mt-4 px-6 py-2">
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
          <button type="button" onClick={onLeave} className="text-red-400 hover:text-red-300 mt-6 block mx-auto underline">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[#202124] text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto" />
          <h2 className="text-2xl font-bold">Opening Meeting</h2>
          <p className="text-slate-400">Checking the room and connecting securely.</p>
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
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 relative ${isChatOpen ? 'pr-0 md:pr-80' : 'pr-0'}`}>
        
        {/* Top Bar - Google Meet Style */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 sm:py-3">
            {/* Left: Time and Meeting Code */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <span className="text-xs sm:text-sm md:text-base font-medium">{currentTime}</span>
              <div className="hidden sm:block w-px h-4 bg-white/30" />
              <div className="hidden sm:flex items-center space-x-2 bg-[#3c4043]/90 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/10">
                <span className="text-xs sm:text-sm font-mono">{roomId}</span>
                <button 
                  type="button" 
                  onClick={handleCopyLink} 
                  className="p-1 rounded hover:bg-white/10 transition-colors group relative"
                  title="Copy meeting link"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-400 sm:w-4 sm:h-4" />
                  ) : (
                    <Copy size={14} className="text-slate-300 group-hover:text-white sm:w-4 sm:h-4" />
                  )}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {copied ? 'Copied!' : 'Copy link'}
                  </div>
                </button>
              </div>
            </div>

            {/* Right: Participant Count */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 bg-[#3c4043]/90 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/10">
              <User size={14} className="text-slate-300 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">{allParticipantsCount}</span>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6 pt-14 sm:pt-16 md:pt-20 pb-32 sm:pb-28 md:pb-24 overflow-y-auto w-full h-full flex items-center justify-center">
          <div className={`${getGridClass()} gap-2 sm:gap-3 md:gap-4 w-full h-full max-w-7xl mx-auto`}>
            {/* Local Video */}
            <div className={`bg-[#3c4043] rounded-lg md:rounded-xl lg:rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[160px] sm:min-h-[200px] md:min-h-[220px] border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)] group ${allParticipantsCount === 1 ? 'max-w-4xl w-full aspect-video' : ''}`}>
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
                  <button type="button" onClick={handleRetryCamera} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition-colors">
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
                    onError={() => setMediaError('Camera failed to load. Please check permissions.')}
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

              {!localStream && !mediaError && !isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#3c4043]">
                  <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <User size={40} className="text-indigo-400" />
                  </div>
                </div>
              )}

              <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 bg-black/70 backdrop-blur-md text-white text-xs sm:text-sm font-medium px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg flex items-center space-x-1 sm:space-x-1.5 border border-white/10">
                {isMuted && <MicOff size={12} className="text-red-400 sm:w-3.5 sm:h-3.5" />}
                <span className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">You{isHost ? ' (Host)' : ''}</span>
              </div>
            </div>

            {/* Remote Videos */}
            {participants.map((participant) => {
              const remoteStream = remoteStreams[participant.socketId];
              return (
                <div
                  key={participant.socketId}
                  className="bg-[#3c4043] rounded-lg md:rounded-xl lg:rounded-2xl relative overflow-hidden flex items-center justify-center group border border-white/5 shadow-xl aspect-video min-h-[160px] sm:min-h-[200px] md:min-h-[220px]"
                >
                  {remoteStream && participant.videoEnabled !== false ? (
                    <RemoteVideoPlayer stream={remoteStream} className="w-full h-full min-h-[160px] sm:min-h-[200px] object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#3c4043]">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="text-2xl sm:text-3xl md:text-4xl text-purple-400 font-semibold">
                          {participant.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 bg-black/70 backdrop-blur-md text-white text-xs sm:text-sm font-medium px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg flex items-center space-x-1 sm:space-x-1.5 border border-white/10">
                    {participant.audioEnabled === false && <MicOff size={12} className="text-red-400 sm:w-3.5 sm:h-3.5" />}
                    <span className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">{participant.username || 'User'}{participant.isHost ? ' (Host)' : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waiting Room Panel (Host Only) */}
        {isHost && waitingUsers.length > 0 && (
          <div className="absolute top-14 sm:top-16 md:top-20 right-2 sm:right-4 md:right-6 z-50 w-[calc(100vw-1rem)] sm:w-80 max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 sm:p-4">
            <h3 className="text-white font-semibold mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
              <span className="bg-indigo-500 text-xs px-2 py-0.5 rounded-full mr-2">{waitingUsers.length}</span>
              Waiting to join
            </h3>
            <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
              {waitingUsers.map((user) => (
                <div key={user.socketId} className="flex items-center justify-between bg-slate-800 p-2 sm:p-3 rounded-lg">
                  <span className="text-xs sm:text-sm font-medium text-slate-200 truncate pr-2">{user.username}</span>
                  <div className="flex space-x-1.5 sm:space-x-2">
                    <button type="button" onClick={() => handleDeny(user.socketId)} className="p-1 sm:p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors" title="Reject">
                      <X size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button type="button" onClick={() => handleAdmit(user.socketId)} className="p-1 sm:p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors" title="Admit">
                      <Check size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile: Meeting Code & Copy Link (Bottom Sheet Style) */}
        <div className="sm:hidden absolute bottom-20 left-0 right-0 z-20 px-3">
          <div className="bg-[#3c4043]/95 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-3">
                <p className="text-xs text-slate-400 mb-0.5">Meeting code</p>
                <p className="text-sm font-mono font-medium">{roomId}</p>
              </div>
              <button 
                type="button" 
                onClick={handleCopyLink} 
                className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 shrink-0"
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Control Bar - Google Meet Style */}
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-[#3c4043] px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full flex items-center space-x-2 sm:space-x-3 md:space-x-4 shadow-2xl border border-white/5">
            {/* Microphone */}
            <button 
              type="button" 
              className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                isMuted 
                  ? 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-lg shadow-red-500/20' 
                  : 'bg-[#4a4d51] hover:bg-[#5f6368] text-white'
              }`} 
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={18} className="sm:w-5 sm:h-5" /> : <Mic size={18} className="sm:w-5 sm:h-5" />}
            </button>

            {/* Camera */}
            <button 
              type="button" 
              className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                isVideoOff 
                  ? 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-lg shadow-red-500/20' 
                  : 'bg-[#4a4d51] hover:bg-[#5f6368] text-white'
              }`} 
              onClick={toggleVideo}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              {isVideoOff ? <VideoOff size={18} className="sm:w-5 sm:h-5" /> : <Video size={18} className="sm:w-5 sm:h-5" />}
            </button>

            {/* Leave Call */}
            <button 
              type="button" 
              className="w-12 h-10 sm:w-14 sm:h-11 md:w-16 md:h-12 rounded-[20px] sm:rounded-[22px] md:rounded-[24px] flex items-center justify-center bg-[#ea4335] text-white hover:bg-[#d93025] transition-all duration-200 shadow-lg shadow-red-500/30 ml-1 sm:ml-1.5 md:ml-2" 
              onClick={onLeave}
              title="Leave call"
            >
              <PhoneOff size={19} className="sm:w-5 sm:h-5 md:w-5.5 md:h-5.5" />
            </button>

            {/* Chat Toggle */}
            <button 
              type="button" 
              className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 relative ${
                isChatOpen 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-[#4a4d51] hover:bg-[#5f6368] text-white'
              }`} 
              onClick={() => setIsChatOpen(!isChatOpen)}
              title="Toggle chat"
            >
              <MessageSquare size={18} className="sm:w-5 sm:h-5" />
              {messages.length > 0 && !isChatOpen && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-indigo-500 rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center border-2 border-[#3c4043]">
                  {messages.length > 9 ? '9+' : messages.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar - Google Meet Style */}
      <div
        className={`
        fixed md:absolute right-0 top-0 bottom-0 w-full md:w-80 bg-[#202124] md:border-l border-[#3c4043] flex flex-col z-40 transition-transform duration-300 shadow-2xl md:shadow-none
        ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      >
        {/* Chat Header */}
        <div className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 border-b border-[#3c4043] bg-[#202124]">
          <span className="text-base sm:text-lg font-medium text-white">In-call messages</span>
          <button 
            type="button" 
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5" 
            onClick={() => setIsChatOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Info Banner */}
        <div className="bg-indigo-500/10 p-3 sm:p-4 text-xs sm:text-sm text-indigo-200 border-b border-indigo-500/20 leading-relaxed">
          Messages can only be seen by people in the call and are deleted when the call ends.
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 text-xs sm:text-sm mt-8">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg, index) => (
              <div key={`${msg.timestamp}-${index}`} className={`flex flex-col space-y-1 ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xs sm:text-sm font-semibold text-white">{msg.username}</span>
                  <span className="text-[10px] sm:text-xs text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`text-xs sm:text-sm p-2 sm:p-2.5 rounded-lg max-w-[85%] break-words ${
                  msg.isOwn 
                    ? 'bg-indigo-500/20 text-indigo-200' 
                    : 'bg-[#3c4043] text-slate-300'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-3 sm:p-4 border-t border-[#3c4043] bg-[#202124]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send a message"
              className="w-full bg-[#3c4043] border border-transparent rounded-full pl-4 sm:pl-5 pr-10 sm:pr-12 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && message.trim()) handleSendMessage();
              }}
            />
            <button 
              type="button" 
              className={`absolute right-1.5 sm:right-2 p-1.5 sm:p-2 rounded-full transition-colors ${
                message.length > 0 
                  ? 'text-indigo-400 hover:bg-indigo-500/10' 
                  : 'text-slate-500 cursor-not-allowed'
              }`} 
              onClick={handleSendMessage} 
              disabled={message.length === 0}
            >
              <Send size={16} className="sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        </div>
      </div>
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 text-sm mt-8">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg, index) => (
              <div key={`${msg.timestamp}-${index}`} className={`flex flex-col space-y-1 ${msg.isOwn ? 'items-end' : 'items-start'}`}>
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
            <button type="button" className={`absolute right-2 p-2 rounded-full transition-colors ${message.length > 0 ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-slate-500 cursor-not-allowed'}`} onClick={handleSendMessage} disabled={message.length === 0}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
