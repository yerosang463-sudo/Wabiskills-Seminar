import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, Edit3 } from 'lucide-react';

export default function UserProfile() {
  const username = localStorage.getItem('username') || 'User';

  return (
    <main className="flex-1 pt-32 lg:pt-40 pb-20 relative z-10 px-6 lg:px-8 xl:px-16 w-full max-w-[1400px] mx-auto text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">
            User Profile
          </h1>
          <p className="text-[#94A3B8] text-lg">Manage your personal information and presence.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-[#0A0F24]/60 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 shadow-[0_10px_30px_-15px_rgba(99,102,241,0.2)] text-center relative">
            <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors">
              <Edit3 size={16} />
            </button>
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] mb-6 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
              <div className="w-full h-full rounded-full bg-[#050816] flex items-center justify-center text-4xl font-bold text-white">
                {username.charAt(0).toUpperCase()}
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-1">{username}</h2>
            <p className="text-emerald-400 text-sm font-semibold mb-6 flex items-center justify-center gap-2">
              <Shield size={14} /> Verified Account
            </p>
            <div className="w-full h-px bg-white/10 mb-6"></div>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-3xl font-extrabold text-white">12</p>
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Meetings</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white">84</p>
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Hours</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="bg-[#0A0F24]/60 backdrop-blur-md border border-white/10 rounded-[2rem] p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="text-indigo-400" /> Personal Information
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">Username</label>
                  <input type="text" defaultValue={username} className="w-full bg-[#050816]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">Email Address</label>
                  <input type="email" defaultValue={`${username.toLowerCase()}@example.com`} className="w-full bg-[#050816]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2">Bio</label>
                <textarea rows="3" placeholder="Tell us about yourself..." className="w-full bg-[#050816]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"></textarea>
              </div>
              <div className="flex justify-end pt-4">
                <button className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
