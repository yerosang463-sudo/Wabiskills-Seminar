import { useEffect } from 'react';
import { 
  Video, Zap, Shield, Monitor, MessageSquare, Users, Lock,
  Smartphone, Globe, Layout, ChevronRight, CheckCircle, Play
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Features({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050816] text-white font-sans overflow-x-hidden relative">
      {/* Background Animated Blobs */}
      <div className="fixed bg-purple-600/10 blur-[150px] w-[800px] h-[800px] rounded-full top-[-10%] right-[-10%] pointer-events-none"></div>
      <div className="fixed bg-blue-600/10 blur-[150px] w-[600px] h-[600px] rounded-full bottom-[-10%] left-[-10%] pointer-events-none"></div>

      {/* Sticky Top Navbar */}
      <header className="fixed top-0 w-full h-20 lg:h-24 flex items-center justify-between px-6 lg:px-8 xl:px-16 z-50 bg-[#050816]/80 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Video className="text-white w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <span className="font-bold text-lg lg:text-xl tracking-wide text-white">
            WabiSeminar
          </span>
        </div>

        <nav className="hidden lg:flex items-center space-x-8">
          <button onClick={() => onNavigate('dashboard')} className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">
            Home
          </button>
          <span className="text-sm font-semibold text-purple-300 bg-purple-600/20 px-6 py-2 rounded-full border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.15)] transition-all">
            Features
          </span>
          <button onClick={() => onNavigate('dashboard')} className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">
            Testimonials
          </button>
        </nav>

        <button 
          className="flex items-center space-x-2 text-sm font-semibold text-white bg-white/10 border border-white/10 px-5 py-2.5 rounded-full hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          onClick={() => onNavigate('dashboard')}
        >
          Go to Dashboard
        </button>
      </header>

      <main className="flex-1 pt-32 lg:pt-40 relative z-10">
        
        {/* 1. HERO SECTION */}
        <section className="px-6 lg:px-8 xl:px-16 pb-24 text-center max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-semibold mb-8 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Zap size={16} className="text-indigo-400" />
              <span>Next-Generation Video Conferencing</span>
            </motion.div>
            <motion.variants variants={itemVariants}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-8">
                Everything you need to <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">collaborate powerfully</span>
              </h1>
            </motion.variants>
            <motion.p variants={itemVariants} className="text-[#94A3B8] text-xl max-w-3xl mx-auto leading-relaxed mb-10">
              WabiSeminar combines ultra-low latency streaming with robust security and intuitive design, creating the perfect environment for your masterclasses, webinars, and team meetings.
            </motion.p>
          </motion.div>
        </section>

        {/* 2. MAIN FEATURE GRID */}
        <section className="px-6 lg:px-8 xl:px-16 pb-32 max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: <Video/>, title: "HD Video Calls", desc: "Crystal clear 4K-ready video powered by advanced WebRTC for zero-lag communication.", color: "indigo" },
              { icon: <Monitor/>, title: "Screen Sharing", desc: "Share your entire screen, specific windows, or tabs with pristine detail and fluid frame rates.", color: "purple" },
              { icon: <Shield/>, title: "Secure Encrypted Meetings", desc: "Enterprise-grade end-to-end encryption ensures your conversations remain completely private.", color: "emerald" },
              { icon: <Zap/>, title: "Instant Meeting Rooms", desc: "No scheduling required. Generate secure links instantly and start collaborating in seconds.", color: "orange" },
              { icon: <Layout/>, title: "Zero Downloads", desc: "Completely browser-based. Your guests can join instantly without installing any software.", color: "blue" },
              { icon: <MessageSquare/>, title: "Real-time Communication", desc: "Integrated chat sidebar for seamless text communication alongside your video stream.", color: "pink" }
            ].map((feat, i) => (
              <motion.div key={i} variants={itemVariants} className="bg-[#0A0F24]/60 backdrop-blur-xl border border-white/5 hover:border-white/10 p-8 rounded-[2rem] hover:-translate-y-2 transition-all duration-300 shadow-lg group">
                <div className={`w-14 h-14 bg-${feat.color}-500/10 group-hover:bg-${feat.color}-500/20 text-${feat.color}-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-${feat.color}-500/20 transition-colors`}>
                  {feat.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feat.title}</h3>
                <p className="text-[#94A3B8] leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 3. INTERACTIVE COLLABORATION & 4. VIDEO CONFERENCING */}
        <section className="py-24 bg-[#0A0F24]/30 border-y border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 xl:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">Dynamic Live <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Collaboration</span></h2>
                <p className="text-[#94A3B8] text-lg leading-relaxed mb-8">
                  Transform passive viewers into active participants. WabiSeminar is built from the ground up to support highly interactive sessions where ideas flow freely.
                </p>
                <ul className="space-y-4">
                  {['Host controls and participant management', 'Real-time text chat with message history', 'Seamless hand-off of screen sharing', 'Low-bandwidth mode for unstable connections'].map((item, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-400 shrink-0 mt-1" size={20} />
                      <span className="text-slate-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative perspective-[1000px]">
                <div className="bg-[#050816] rounded-[2rem] border border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] p-2 rotate-y-[-5deg] transform-gpu">
                  <div className="bg-[#111827] rounded-[1.5rem] overflow-hidden aspect-video relative flex items-center justify-center border border-white/5">
                    {/* Mock Video UI */}
                    <div className="absolute inset-0 grid grid-cols-2 gap-2 p-2">
                       <div className="bg-[#1F2937] rounded-xl flex items-center justify-center border border-white/5"><Users size={48} className="text-slate-600"/></div>
                       <div className="bg-[#1F2937] rounded-xl flex items-center justify-center border border-white/5"><Users size={48} className="text-slate-600"/></div>
                       <div className="bg-[#1F2937] rounded-xl flex items-center justify-center border border-white/5"><Users size={48} className="text-slate-600"/></div>
                       <div className="bg-[#1F2937] rounded-xl flex items-center justify-center border border-white/5"><Users size={48} className="text-slate-600"/></div>
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white"><Video size={18}/></div>
                      <div className="w-10 h-10 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center"><Monitor size={18}/></div>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-6 -right-6 bg-[#0A0F24]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-semibold text-sm">Latency: 12ms</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 5. SECURITY & 6. ANALYTICS & 7. MOBILE */}
        <section className="py-32 px-6 lg:px-8 xl:px-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-[#0A0F24] to-[#050816] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full"></div>
              <Lock size={40} className="text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Bank-grade Security</h3>
              <p className="text-[#94A3B8] leading-relaxed mb-6">Every meeting room is generated with a unique cryptographic ID. Waiting rooms give you complete control over who enters.</p>
              <div className="bg-white/5 rounded-xl p-4 text-sm text-purple-200 border border-white/5">
                End-to-End Encrypted (E2EE)
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-[#0A0F24] to-[#050816] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full"></div>
              <Globe size={40} className="text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Global Network</h3>
              <p className="text-[#94A3B8] leading-relaxed mb-6">Intelligent routing connects users to the nearest edge node, ensuring flawless audio and video regardless of geography.</p>
              <div className="bg-white/5 rounded-xl p-4 text-sm text-blue-200 border border-white/5 flex items-center space-x-2">
                 <Zap size={16}/><span>99.99% Uptime SLA</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-[#0A0F24] to-[#050816] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full"></div>
              <Smartphone size={40} className="text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Mobile Responsive</h3>
              <p className="text-[#94A3B8] leading-relaxed mb-6">Join meetings directly from any iOS or Android web browser. Our responsive UI adapts perfectly to smaller screens.</p>
              <div className="bg-white/5 rounded-xl p-4 text-sm text-emerald-200 border border-white/5 flex space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span><span>No App Store required</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 8. CTA SECTION */}
        <section className="py-24 px-6 lg:px-8 xl:px-16 mb-20 relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-purple-500/30 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-[0_0_80px_-15px_rgba(124,58,237,0.3)]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight">Ready to experience the future of seminars?</h2>
              <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto font-light">Join thousands of professionals already hosting unlimited, high-definition meetings for free.</p>
              <button 
                onClick={() => onNavigate('dashboard')}
                className="bg-white text-indigo-950 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-slate-100 hover:scale-105 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] flex items-center space-x-3 mx-auto"
              >
                <span>Start Free Meeting</span>
                <ChevronRight size={24} />
              </button>
            </div>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#02040A] pt-12 pb-8 px-6 lg:px-8 xl:px-16 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-[#94A3B8]">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
             <Video size={20} className="text-indigo-400"/>
             <span className="font-bold text-white text-lg">WabiSeminar</span>
          </div>
          <p>© 2026 WabiSeminar Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
