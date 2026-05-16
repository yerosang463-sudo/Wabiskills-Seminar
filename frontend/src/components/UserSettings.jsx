import { motion } from 'framer-motion';
import { Settings, Bell, Lock, Video, Shield } from 'lucide-react';

export default function UserSettings() {
  return (
    <main className="flex-1 pt-32 lg:pt-40 pb-20 relative z-10 px-6 lg:px-8 xl:px-16 w-full max-w-[1400px] mx-auto text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">
            Account Settings
          </h1>
          <p className="text-[#94A3B8] text-lg">Manage your preferences, security, and notifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-2"
        >
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20 text-left transition-colors">
            <Settings size={18} /> General
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#94A3B8] hover:bg-white/5 hover:text-white font-semibold border border-transparent text-left transition-colors">
            <Video size={18} /> Meeting Defaults
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#94A3B8] hover:bg-white/5 hover:text-white font-semibold border border-transparent text-left transition-colors">
            <Lock size={18} /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#94A3B8] hover:bg-white/5 hover:text-white font-semibold border border-transparent text-left transition-colors">
            <Bell size={18} /> Notifications
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 space-y-8"
        >
          <div className="bg-[#0A0F24]/60 backdrop-blur-md border border-white/10 rounded-[2rem] p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings className="text-indigo-400" /> General Preferences
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <h4 className="font-semibold text-white">Dark Mode</h4>
                  <p className="text-sm text-[#94A3B8]">WabiSeminar uses dark mode by default for premium aesthetics.</p>
                </div>
                <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-not-allowed opacity-80">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <h4 className="font-semibold text-white">Hardware Acceleration</h4>
                  <p className="text-sm text-[#94A3B8]">Improves video performance during masterclasses.</p>
                </div>
                <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0A0F24]/60 backdrop-blur-md border border-white/10 rounded-[2rem] p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-rose-400">
              <Shield className="text-rose-400" /> Danger Zone
            </h3>
            <p className="text-sm text-[#94A3B8] mb-6">Permanently delete your account and all associated meeting history. This action cannot be undone.</p>
            <button className="px-6 py-2.5 rounded-xl font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all">
              Delete Account
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
