import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, Plus, Link, Calendar, Clock, Loader2, ArrowRight, Shield, Activity, Users, Copy, Trash2, X } from 'lucide-react';
import api from '../services/api.js';
import { roomIdFromPathname } from '../routeUtils.js';

export default function UserDashboard({ onNavigate, onJoinRoom, notify }) {
  const [myRooms, setMyRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinId, setJoinId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [username, setUsername] = useState('User');
  const [deleteModalRoomId, setDeleteModalRoomId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  const createInFlightRef = useRef(false);

  useEffect(() => {
    setUsername(localStorage.getItem('username') || 'User');
    const loadRooms = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.getUserRooms(token);
          if (response.success && response.data) {
            setMyRooms(response.data);
          }
        }
      } catch (error) {
        notify('error', 'Failed to load your meetings history.');
      } finally {
        setIsLoading(false);
      }
    };
    loadRooms();
    window.scrollTo(0, 0);
  }, []);

  const extractRoomId = (value) => {
    const raw = value.trim();
    if (!raw) return '';
    try {
      const url = raw.startsWith('http') ? new URL(raw) : null;
      if (url) return roomIdFromPathname(url.pathname) || '';
    } catch { /* empty */ }
    if (raw.includes('/')) {
      const fromPath = roomIdFromPathname(raw.startsWith('/') ? raw : `/${raw}`);
      if (fromPath) return fromPath;
    }
    return raw.split('?')[0].replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  };

  const handleCreateRoom = async () => {
    if (createInFlightRef.current) return;
    createInFlightRef.current = true;
    setIsCreating(true);

    try {
      const token = localStorage.getItem('token');
      const response = await api.createRoom(token);
      
      if (!response.success || !response.data?.roomId) {
        notify('error', response.message || 'Failed to create room.');
        return;
      }

      notify('success', 'Meeting created successfully!');
      onJoinRoom(response.data.roomId);
    } catch (error) {
      notify('error', 'Network error. Please try again.');
    } finally {
      setIsCreating(false);
      createInFlightRef.current = false;
    }
  };

  const handleJoinRoom = async () => {
    const id = extractRoomId(joinId);
    if (!id || isJoining) return;
    setIsJoining(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.getRoom(token, id);
      if (!response.success) {
        notify('error', response.status === 404 ? 'Room not found.' : response.message || 'Unable to join.');
        return;
      }
      notify('success', 'Joining meeting...');
      onJoinRoom(id);
    } catch (error) {
      notify('error', 'Network error. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyLink = (roomId) => {
    const link = `${window.location.origin}/meeting/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(roomId);
    notify('success', 'Invite link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteRoom = async () => {
    if (!deleteModalRoomId || isDeleting) return;
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.deleteRoom(token, deleteModalRoomId);
      
      if (!response.success) {
        notify('error', response.message || 'Failed to delete room.');
        return;
      }
      
      notify('success', 'Meeting room deleted.');
      setMyRooms(prev => prev.filter(r => r.roomId !== deleteModalRoomId));
    } catch (error) {
      notify('error', 'Network error while deleting.');
    } finally {
      setIsDeleting(false);
      setDeleteModalRoomId(null);
    }
  };

  return (
    <main className="flex-1 pt-32 lg:pt-40 pb-20 relative z-10 px-6 lg:px-8 xl:px-16 w-full max-w-[1400px] mx-auto text-white light:text-slate-900 overflow-hidden md:overflow-visible">
      {/* Background Ambient Effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
            Welcome back, <span className="text-orange-500 light:text-blue-600">{username || 'Guest'}</span>
          </h1>
          <p className="text-[#94A3B8] light:text-slate-600 text-lg">Manage your masterclasses, join sessions, or review your history.</p>
        </motion.div>
      </div>

      {/* Main Grid Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        
        {/* Create Meeting Card (Col 1) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group bg-[#0A0F24]/80 light:bg-white backdrop-blur-xl light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-3xl p-8 shadow-2xl light:shadow-xl hover:-translate-y-1 hover:border-indigo-500/40 light:hover:border-indigo-400 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] group-hover:bg-indigo-500/20 transition-colors pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-500/10 light:bg-blue-50 text-blue-400 light:text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 light:border-blue-200 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <Video size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-3 tracking-tight">Host a Session</h2>
            <p className="text-[#94A3B8] light:text-slate-600 text-sm mb-8 leading-relaxed">
              Launch a high-performance, encrypted video room instantly. Share the link and go live with your audience.
            </p>
          </div>
          <button 
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="cursor-pointer relative z-10 w-full py-4 rounded-full font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(79,70,229,0.4)] hover:shadow-[0_10px_40px_rgba(79,70,229,0.6)] disabled:opacity-70 disabled:cursor-not-allowed group/btn"
          >
            {isCreating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} className="group-hover/btn:rotate-90 transition-transform duration-300" />}
            {isCreating ? 'Creating...' : 'New Meeting'}
          </button>
        </motion.div>

        {/* Join Meeting Card (Col 2) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group bg-[#0A0F24]/80 light:bg-white backdrop-blur-xl light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-3xl p-8 shadow-2xl light:shadow-xl hover:-translate-y-1 hover:border-purple-500/40 light:hover:border-purple-400 transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] group-hover:bg-purple-500/20 transition-colors pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-orange-500/10 light:bg-orange-50 text-orange-400 light:text-orange-600 rounded-2xl flex items-center justify-center mb-6 border border-orange-500/20 light:border-orange-200 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <Link size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-3 tracking-tight">Join a Session</h2>
            <p className="text-[#94A3B8] light:text-slate-600 text-sm mb-6 leading-relaxed">
              Enter a Room ID or paste an invite link to connect directly to an active session in seconds.
            </p>
          </div>
          <div className="flex flex-col gap-3 relative z-10">
            <input 
              type="text" 
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              placeholder="e.g. abc-defg-hij"
              className="w-full bg-[#050816]/50 light:bg-slate-50 border border-white/10 light:border-slate-200 rounded-2xl px-4 py-3.5 text-white light:text-slate-900 placeholder-[#94A3B8] light:placeholder-slate-400 focus:border-purple-500/50 light:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 light:focus:ring-purple-200 outline-none transition-all shadow-inner"
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
            <button 
              onClick={handleJoinRoom}
              disabled={isJoining || !joinId.trim()}
              className="cursor-pointer w-full py-3.5 rounded-full font-bold bg-white/10 light:bg-slate-100 border border-white/10 light:border-slate-200 hover:bg-white/20 light:hover:bg-slate-200 text-white light:text-slate-800 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/join shadow-sm hover:shadow-md"
            >
              {isJoining ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} className="group-hover/join:translate-x-1 transition-transform" />}
              {isJoining ? 'Joining...' : 'Join Now'}
            </button>
          </div>
        </motion.div>

        {/* Stats Summary (Col 3) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-6"
        >
          <div className="group bg-[#0A0F24]/80 light:bg-white backdrop-blur-xl light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-3xl p-6 flex items-center gap-6 hover:-translate-y-1 hover:border-blue-500/30 light:hover:border-blue-300 shadow-xl light:shadow-md transition-all duration-300 flex-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 light:bg-blue-50 flex items-center justify-center text-blue-400 light:text-blue-600 border border-blue-500/20 light:border-blue-200 shrink-0 relative z-10 shadow-inner group-hover:scale-110 transition-transform">
              <Activity size={28} />
            </div>
            <div className="relative z-10">
              <p className="text-[#94A3B8] light:text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Hosted</p>
              <h3 className="text-4xl font-black text-white light:text-slate-900">{myRooms.length}</h3>
            </div>
          </div>
          
          <div className="group bg-[#0A0F24]/80 light:bg-white backdrop-blur-xl light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-3xl p-6 flex items-center gap-6 hover:-translate-y-1 hover:border-orange-500/30 light:hover:border-orange-300 shadow-xl light:shadow-md transition-all duration-300 flex-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 light:bg-orange-50 flex items-center justify-center text-orange-400 light:text-orange-600 border border-orange-500/20 light:border-orange-200 shrink-0 relative z-10 shadow-inner group-hover:scale-110 transition-transform">
              <Shield size={28} />
            </div>
            <div className="relative z-10">
              <p className="text-[#94A3B8] light:text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Security Status</p>
              <h3 className="text-2xl font-black text-emerald-400 light:text-emerald-500 flex items-center gap-2">
                Protected 
                <span className="relative flex h-3 w-3 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                </span>
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* History Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-white light:text-slate-900">
            <Clock size={24} className="text-indigo-400 light:text-indigo-600" />
            Meeting History
          </h2>
        </div>

        {isLoading ? (
          <div className="bg-[#0A0F24]/40 light:bg-slate-50 border border-white/5 light:border-slate-200 rounded-3xl p-12 flex justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : myRooms.length > 0 ? (
          <div className="bg-[#0A0F24]/80 light:bg-white backdrop-blur-xl light:backdrop-blur-none border border-white/10 light:border-slate-200 rounded-3xl overflow-hidden shadow-2xl light:shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 light:border-slate-200 bg-white/5 light:bg-slate-50/80">
                    <th className="py-5 px-8 text-xs font-bold text-[#94A3B8] light:text-slate-500 uppercase tracking-widest">Room ID</th>
                    <th className="py-5 px-8 text-xs font-bold text-[#94A3B8] light:text-slate-500 uppercase tracking-widest">Created</th>
                    <th className="py-5 px-8 text-xs font-bold text-[#94A3B8] light:text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="py-5 px-8 text-xs font-bold text-[#94A3B8] light:text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 light:divide-slate-100">
                  {myRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-white/[0.04] light:hover:bg-slate-50 transition-colors group">
                      <td className="py-5 px-8">
                        <div className="font-mono text-sm text-indigo-300 light:text-indigo-600 font-bold bg-indigo-500/10 light:bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-500/20 light:border-indigo-100 inline-block">
                          {room.roomId}
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#E2E8F0] light:text-slate-700">
                          <Calendar size={16} className="text-indigo-400 light:text-indigo-500" />
                          {new Date(room.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 light:bg-emerald-50 text-emerald-400 light:text-emerald-600 border border-emerald-500/20 light:border-emerald-200">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                          Active
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button className="cursor-pointer"  
                            onClick={() => handleCopyLink(room.roomId)}
                            className="p-2 text-[#94A3B8] light:text-slate-500 hover:text-white light:text-slate-800 bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 rounded-xl transition-all border border-white/10 light:border-slate-200 hover:shadow-md"
                            title="Copy Invite Link"
                          >
                            <Copy size={18} className={copiedId === room.roomId ? "text-emerald-400 light:text-emerald-600" : ""} />
                          </button>
                          
                          <button className="cursor-pointer"  
                            onClick={() => onJoinRoom(room.roomId)}
                            className="text-sm font-bold text-white light:text-white transition-all bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-full shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] flex items-center gap-2"
                          >
                            Rejoin
                          </button>
                          
                          <button className="cursor-pointer"  
                            onClick={() => setDeleteModalRoomId(room.roomId)}
                            className="p-2 text-rose-400 light:text-rose-500 hover:text-rose-300 light:hover:text-rose-600 bg-rose-500/10 light:bg-rose-50 hover:bg-rose-500/20 light:hover:bg-rose-100 rounded-xl transition-all border border-rose-500/20 light:border-rose-200 hover:shadow-md"
                            title="Delete Room"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-[#0A0F24]/40 light:bg-slate-50 border border-dashed border-white/10 light:border-slate-300 rounded-[2rem] p-16 text-center flex flex-col items-center">
            <Video size={48} className="text-slate-600 light:text-slate-400 light:text-slate-500 mb-4" />
            <p className="text-white light:text-slate-900 text-xl font-bold mb-2">No meetings yet</p>
            <p className="text-[#94A3B8] light:text-slate-500 text-sm max-w-sm mb-6">You haven't hosted any masterclasses yet. Create your first secure meeting room to get started.</p>
            <button 
              onClick={handleCreateRoom}
              className="cursor-pointer px-6 py-2.5 bg-white/10 light:bg-slate-200 hover:bg-white/15 light:hover:bg-slate-300 text-white light:text-slate-800 font-semibold rounded-full border border-white/10 light:border-slate-300 transition-colors"
            >
              Create First Room
            </button>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      {deleteModalRoomId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050816]/90 light:bg-white/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#0A0F24] light:bg-white border border-white/10 light:border-slate-200 rounded-[2rem] max-w-md w-full p-8 shadow-2xl relative">
            <button className="cursor-pointer"  
              onClick={() => !isDeleting && setDeleteModalRoomId(null)}
              className="absolute top-6 right-6 text-[#94A3B8] light:text-slate-500 hover:text-white light:text-slate-900 light:hover:text-slate-900 transition-colors bg-white/5 light:bg-slate-100 p-2 rounded-2xl"
            >
              <X size={20} />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 light:bg-rose-50 flex items-center justify-center mb-6 border border-rose-500/20 light:border-rose-200">
              <Trash2 className="text-rose-400 light:text-rose-600" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white light:text-slate-900 mb-2">Delete Meeting Room?</h2>
            <p className="text-[#94A3B8] light:text-slate-600 text-sm leading-relaxed mb-8">
              Are you sure you want to delete room <strong className="text-indigo-300 light:text-indigo-600">{deleteModalRoomId}</strong>? This action cannot be undone and any future participants will not be able to join.
            </p>
            <div className="flex gap-4">
              <button className="cursor-pointer"  
                onClick={() => setDeleteModalRoomId(null)}
                disabled={isDeleting}
                className="flex-1 py-3.5 rounded-2xl font-bold bg-white/5 light:bg-slate-100 border border-white/10 light:border-slate-200 hover:bg-white/10 light:hover:bg-slate-200 light:bg-slate-200 light:hover:bg-slate-200 text-white light:text-slate-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteRoom}
                disabled={isDeleting}
                className="cursor-pointer flex-1 py-3.5 rounded-full font-bold bg-rose-600 hover:bg-rose-500 text-white light:text-slate-900 transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : null}
                {isDeleting ? 'Deleting...' : 'Delete Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
