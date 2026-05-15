import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Monitor, Shield, Zap, Lock, Globe, MessageSquare, Layers,
  ChevronRight, Smartphone, BarChart3, Users, Layout, Activity
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Features({ onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] text-white font-sans overflow-hidden relative">
      {/* Background Animated Blobs */}
      <div className="fixed bg-indigo-600/10 blur-[150px] w-[800px] h-[800px] rounded-full top-[-20%] left-[-10%] pointer-events-none"></div>
      <div className="fixed bg-purple-600/10 blur-[150px] w-[600px] h-[600px] rounded-full bottom-[-10%] right-[-10%] pointer-events-none"></div>

      {/* Navbar */}
      <motion.header 
        className={`fixed top-0 w-full flex items-center justify-between px-6 lg:px-8 xl:px-16 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'h-20 lg:h-24 bg-[#050816]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' 
            : 'h-24 lg:h-28 bg-transparent border-b-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => onNavigate('dashboard')}>
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-shadow">
            <Video className="text-white w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <span className="font-bold text-lg lg:text-xl tracking-wide text-white">WabiSeminar</span>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('dashboard')} 
          className="text-sm font-semibold text-white bg-white/5 border border-white/10 px-6 py-2.5 rounded-full hover:bg-white/10 hover:border-white/20 transition-all"
        >
          Back to Home
        </motion.button>
      </motion.header>

      <main className="pt-32 lg:pt-40 pb-20 relative z-10 max-w-[1400px] mx-auto">
        
        {/* 1. Hero Section */}
        <section className="text-center px-6 mb-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 w-fit text-sm font-semibold shadow-[0_0_15px_rgba(99,102,241,0.15)] mb-8">
              <Zap size={16} className="text-indigo-400" />
              <span>Powerful Features</span>
            </motion.div>
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]">
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400">flawless</span> execution.
            </motion.h1>
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-[#94A3B8] leading-relaxed max-w-2xl font-light mb-10">
              Everything you need to host professional, engaging, and secure meetings without the complexity of legacy platforms. No downloads. No limits. Just instant connection.
            </motion.p>
          </motion.div>
        </section>

        {/* 2. Main Feature Grid */}
        <section className="px-6 mb-32">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: <Zap size={24}/>, title: "Instant Meeting Rooms", desc: "Generate secure meeting links in one click. No scheduling or setup required.", colorClass: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", hoverClass: "hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]" },
              { icon: <Video size={24}/>, title: "HD Video Calls", desc: "Crystal clear 1080p video architecture optimized for low bandwidth.", colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", hoverClass: "hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]" },
              { icon: <Monitor size={24}/>, title: "Screen Sharing", desc: "Share your entire screen or specific windows with zero latency.", colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/20", hoverClass: "hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]" },
              { icon: <Layers size={24}/>, title: "Live Collaboration", desc: "Interactive tools for real-time whiteboarding and document sharing.", colorClass: "text-pink-400 bg-pink-500/10 border-pink-500/20", hoverClass: "hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]" },
              { icon: <Shield size={24}/>, title: "Secure Encrypted", desc: "End-to-end encryption ensures your masterclasses remain private and secure.", colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20", hoverClass: "hover:border-rose-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]" },
              { icon: <Smartphone size={24}/>, title: "Responsive Access", desc: "Flawless experience across desktops, tablets, and smartphones.", colorClass: "text-teal-400 bg-teal-500/10 border-teal-500/20", hoverClass: "hover:border-teal-500/50 hover:shadow-[0_0_30px_rgba(20,184,166,0.3)]" },
              { icon: <Globe size={24}/>, title: "Zero Downloads", desc: "Browser-based access means your attendees join instantly without friction.", colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/20", hoverClass: "hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]" },
              { icon: <MessageSquare size={24}/>, title: "Real-time Comm.", desc: "Synchronized chat and audio for seamless audience interaction.", colorClass: "text-orange-400 bg-orange-500/10 border-orange-500/20", hoverClass: "hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]" }
            ].map((f, i) => (
              <motion.div key={i} variants={fadeIn} whileHover={{ scale: 1.03, y: -5 }} className={`bg-[#0A0F24]/60 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] transition-all duration-300 group ${f.hoverClass}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border group-hover:scale-110 transition-transform ${f.colorClass}`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-[#94A3B8] leading-relaxed text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 3. Interactive Collaboration Section */}
        <section className="px-6 mb-32">
          <div className="bg-gradient-to-br from-[#0A0F24] to-[#160B2A] border border-purple-500/20 rounded-[3rem] p-10 md:p-16 lg:p-20 overflow-hidden relative shadow-[0_30px_60px_-15px_rgba(124,58,237,0.2)]">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 w-fit text-xs font-bold mb-6">
                  Collaboration
                </div>
                <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">Designed for interactive masterclasses.</h2>
                <p className="text-[#94A3B8] text-lg mb-8 leading-relaxed">
                  Engage your audience with tools built for interaction. Whether you're presenting a slide deck, reviewing code, or hosting a Q&A, WabiSeminar makes collaboration feel natural.
                </p>
                <ul className="space-y-4">
                  {[
                    "Host controls to mute participants or toggle video.",
                    "Waiting room functionality to screen attendees.",
                    "Real-time synchronized chat without interrupting the flow."
                  ].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-white">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">✓</div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
                <div className="aspect-[4/3] rounded-3xl bg-[#050816] border border-white/10 shadow-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent"></div>
                  {/* Floating Mock UI */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-[#0A0F24]/80 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-between px-6">
                     <div className="flex space-x-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Video size={18}/></div>
                        <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400"><Monitor size={18}/></div>
                     </div>
                     <div className="w-16 h-10 rounded-xl bg-purple-500 flex items-center justify-center font-bold">End</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 4. Video Conferencing & 5. Security & 6. Analytics */}
        <section className="px-6 mb-32">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Video Quality */}
            <motion.div variants={fadeIn} whileHover={{ scale: 1.02, y: -5 }} className="bg-[#0A0F24]/60 backdrop-blur-lg border border-white/5 p-10 rounded-[2rem] relative overflow-hidden group hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full pointer-events-none group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-500"></div>
              <Layout size={32} className="text-blue-400 mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-4 relative z-10">Adaptive Streaming</h3>
              <p className="text-[#94A3B8] leading-relaxed relative z-10">Our smart WebRTC engine dynamically adjusts video quality based on each participant's network connection, preventing lag and disconnects.</p>
            </motion.div>

            {/* Security */}
            <motion.div variants={fadeIn} whileHover={{ scale: 1.02, y: -5 }} className="bg-[#0A0F24]/60 backdrop-blur-lg border border-white/5 p-10 rounded-[2rem] relative overflow-hidden group hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-500"></div>
              <Shield size={32} className="text-emerald-400 mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-4 relative z-10">Enterprise Security</h3>
              <p className="text-[#94A3B8] leading-relaxed relative z-10">Every stream is encrypted end-to-end. Hosts have complete control over who enters the room with mandatory admission approvals.</p>
            </motion.div>

            {/* Analytics */}
            <motion.div variants={fadeIn} whileHover={{ scale: 1.02, y: -5 }} className="bg-[#0A0F24]/60 backdrop-blur-lg border border-white/5 p-10 rounded-[2rem] relative overflow-hidden group hover:border-rose-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.2)] transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full pointer-events-none group-hover:bg-rose-500/20 group-hover:scale-110 transition-all duration-500"></div>
              <Activity size={32} className="text-rose-400 mb-6 relative z-10" />
              <h3 className="text-2xl font-bold mb-4 relative z-10">Performance Insights</h3>
              <p className="text-[#94A3B8] leading-relaxed relative z-10">Track attendance and engagement metrics directly from your dashboard. Understand how your masterclasses are performing over time.</p>
            </motion.div>
          </motion.div>
        </section>

        {/* 7. Mobile Compatibility */}
        <section className="px-6 mb-32">
          <div className="bg-[#050816] border border-white/10 rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-teal-500/5 group-hover:from-blue-500/10 group-hover:to-teal-500/10 transition-colors duration-700"></div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="md:w-1/2 relative z-10 mb-10 md:mb-0">
              <Smartphone size={40} className="text-teal-400 mb-6" />
              <h2 className="text-4xl font-extrabold mb-6">Zero Downloads. <br/>100% Mobile Ready.</h2>
              <p className="text-[#94A3B8] text-lg leading-relaxed max-w-md">
                Your attendees shouldn't have to install bulky apps just to join your seminar. WabiSeminar runs perfectly in any modern mobile browser with full functionality.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="md:w-5/12 relative z-10 flex justify-center">
               {/* Mock Mobile Device */}
               <div className="w-[280px] h-[580px] bg-[#0A0F24] rounded-[3rem] border-[8px] border-[#1E113C] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                  <div className="absolute top-0 w-full h-6 bg-[#1E113C] flex justify-center rounded-b-xl"><div className="w-1/3 h-4 bg-[#0A0F24] rounded-b-xl"></div></div>
                  <div className="w-full h-full bg-[#050816] pt-10 px-4 flex flex-col">
                    <div className="flex-1 bg-[#160B2A] rounded-2xl border border-white/5 mb-4 relative overflow-hidden">
                       <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center opacity-70"></div>
                    </div>
                    <div className="h-20 bg-[#0A0F24] rounded-2xl mb-4 flex items-center justify-around border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400"><Video size={16}/></div>
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"><Monitor size={16}/></div>
                      <div className="w-12 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white text-xs font-bold">End</div>
                    </div>
                  </div>
               </div>
            </motion.div>
          </div>
        </section>

        {/* 8. CTA Section */}
        <section className="px-6 mb-20 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-[3rem] p-12 md:p-20 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.5)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">Ready to host your next masterpiece?</h2>
              <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">Join thousands of professionals who have upgraded their meeting experience with WabiSeminar.</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('dashboard')}
                className="bg-white text-indigo-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl flex items-center justify-center mx-auto space-x-2 group"
              >
                <span>Start for free</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        </section>

      </main>
    </div>
  );
}
