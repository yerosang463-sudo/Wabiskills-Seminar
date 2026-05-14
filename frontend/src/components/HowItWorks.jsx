import { useEffect } from 'react';
import { 
  Video, UserPlus, Play, Users, ScreenShare, Sparkles, 
  ChevronRight, ArrowDown, ArrowRight, MessageSquare, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function HowItWorks({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const steps = [
    {
      number: "01",
      title: "Create Account",
      desc: "Sign up in seconds. No credit card required. Instantly unlock your personal meeting dashboard.",
      icon: <UserPlus size={28} />,
      color: "indigo"
    },
    {
      number: "02",
      title: "Start Instant Room",
      desc: "Click 'Create Room' to instantly generate a secure, uniquely encrypted meeting URL.",
      icon: <Play size={28} />,
      color: "purple"
    },
    {
      number: "03",
      title: "Invite Participants",
      desc: "Share your unique room ID or link. Guests can join instantly from any browser without downloading apps.",
      icon: <Users size={28} />,
      color: "emerald"
    },
    {
      number: "04",
      title: "Collaborate Live",
      desc: "Enjoy ultra-low latency 4K video, real-time chat, and seamless screen sharing with your audience.",
      icon: <ScreenShare size={28} />,
      color: "blue"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#050816] text-white font-sans overflow-x-hidden relative">
      
      
      

      
      

      <main className="flex-1 pt-32 lg:pt-40 relative z-10">
        
        {/* 1. HERO SECTION */}
        <section className="px-6 lg:px-8 xl:px-16 pb-24 text-center max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm font-semibold mb-8 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Sparkles size={16} className="text-emerald-400" />
              <span>Frictionless Onboarding</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-8">
              From zero to <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">masterclass in seconds</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-[#94A3B8] text-xl max-w-3xl mx-auto leading-relaxed mb-10">
              We've engineered the fastest, most intuitive way to start and join high-definition video meetings. No downloads. No complex setups. Just seamless connection.
            </motion.p>
          </motion.div>
        </section>

        {/* 2. 4-STEP PROCESS TIMELINE */}
        <section className="px-6 lg:px-8 xl:px-16 pb-32 max-w-7xl mx-auto relative">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}
            className="relative"
          >
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-[100px] left-[10%] right-[10%] h-1 bg-gradient-to-r from-indigo-500/0 via-purple-500/20 to-blue-500/0">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400 to-transparent w-full h-full opacity-50 animate-[pulse_3s_ease-in-out_infinite]"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
              {steps.map((step, i) => (
                <motion.div key={i} variants={itemVariants} className="relative group flex flex-col items-center lg:items-start text-center lg:text-left z-10">
                  
                  {/* Step Node */}
                  <div className={`w-20 h-20 bg-[#0A0F24]/90 backdrop-blur-xl border-2 border-${step.color}-500/40 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:-translate-y-2 transition-transform duration-300 mx-auto lg:mx-0 relative`}>
                    <div className={`absolute inset-0 bg-${step.color}-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <div className={`text-${step.color}-400 relative z-10`}>{step.icon}</div>
                    
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#050816] border border-white/10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  {/* Step Content */}
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-[#94A3B8] leading-relaxed max-w-[280px]">{step.desc}</p>
                  
                  {/* Mobile connecting arrow */}
                  {i < steps.length - 1 && (
                    <div className="lg:hidden mt-8 text-white/20">
                      <ArrowDown size={32} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* 3. INTERACTIVE WORKFLOW VISUALIZATION */}
        <section className="py-24 bg-[#0A0F24]/30 border-y border-white/5 relative z-10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 xl:px-16">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">The Host Workflow</h2>
              <p className="text-[#94A3B8] text-lg">A visual breakdown of exactly what happens when you hit "Create Room".</p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              {/* Central Glowing Orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {/* Visual Card 1 */}
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-[#050816]/80 backdrop-blur-xl border border-indigo-500/30 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center text-center">
                   <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/30">
                     <Shield size={20}/>
                   </div>
                   <h4 className="font-bold mb-2">Cryptographic Room Gen</h4>
                   <p className="text-xs text-[#94A3B8]">A secure, unique UUID is assigned instantly.</p>
                </motion.div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center text-indigo-500/50">
                  <ArrowRight size={32} className="animate-pulse" />
                </div>

                {/* Visual Card 2 */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-gradient-to-b from-indigo-600/20 to-[#050816]/80 backdrop-blur-xl border border-purple-500/40 rounded-[2rem] p-6 shadow-[0_0_30px_rgba(147,51,234,0.2)] flex flex-col items-center text-center scale-105">
                   <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 border border-purple-500/30 shadow-[0_0_20px_rgba(147,51,234,0.4)]">
                     <Video size={28}/>
                   </div>
                   <h4 className="font-bold mb-2">WebRTC Handshake</h4>
                   <p className="text-xs text-[#94A3B8]">Peer-to-peer tunnels open via TURN/STUN servers.</p>
                </motion.div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center text-purple-500/50">
                  <ArrowRight size={32} className="animate-pulse" />
                </div>

                {/* Visual Card 3 */}
                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-[#050816]/80 backdrop-blur-xl border border-blue-500/30 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center text-center">
                   <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 border border-blue-500/30">
                     <Users size={20}/>
                   </div>
                   <h4 className="font-bold mb-2">Socket Broadcasting</h4>
                   <p className="text-xs text-[#94A3B8]">Waiting room is active, ready for attendees.</p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. DEMO PREVIEW */}
        <section className="py-24 px-6 lg:px-8 xl:px-16 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-tr from-[#0A0F24] to-[#160B2A] border border-white/10 rounded-[3rem] p-4 lg:p-10 shadow-2xl relative overflow-hidden group">
             {/* Mock UI Header */}
             <div className="flex items-center space-x-2 mb-6 px-4">
               <div className="w-3 h-3 rounded-full bg-rose-500"></div>
               <div className="w-3 h-3 rounded-full bg-amber-500"></div>
               <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
             </div>
             
             {/* Mock Meeting UI */}
             <div className="bg-[#050816] rounded-[2rem] border border-white/5 overflow-hidden flex flex-col lg:flex-row shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] aspect-video lg:aspect-auto lg:h-[500px]">
                {/* Video Area */}
                <div className="flex-1 p-4 flex flex-col relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30"></div>
                  <div className="flex-1 border border-indigo-500/30 rounded-2xl relative overflow-hidden bg-gradient-to-br from-indigo-900/20 to-transparent backdrop-blur-sm">
                     <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-semibold border border-white/10 flex items-center space-x-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                       <span>You (Host)</span>
                     </div>
                  </div>
                  {/* Bottom Bar */}
                  <div className="h-16 mt-4 bg-[#0A0F24]/80 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center space-x-4 relative z-10">
                     <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Video size={18}/></div>
                     <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30"><Play size={18}/></div>
                  </div>
                </div>
                {/* Chat Sidebar Mock */}
                <div className="w-80 border-l border-white/5 bg-[#0A0F24]/60 backdrop-blur-xl hidden lg:flex flex-col relative z-10">
                   <div className="h-16 border-b border-white/5 flex items-center px-6 font-bold text-sm text-slate-300">Live Chat</div>
                   <div className="flex-1 p-6 space-y-4">
                     <div className="bg-indigo-500/20 text-indigo-100 p-3 rounded-xl rounded-tr-sm text-xs self-end ml-10 border border-indigo-500/20">Welcome to the masterclass everyone!</div>
                     <div className="bg-white/5 p-3 rounded-xl rounded-tl-sm text-xs mr-10 border border-white/5 text-slate-300">Can't wait to get started!</div>
                   </div>
                </div>
             </div>
          </motion.div>
        </section>

        {/* 5. FAQ PREVIEW CTA */}
        <section className="py-24 px-6 lg:px-8 xl:px-16 mb-20 relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Still have questions?</h2>
            <p className="text-[#94A3B8] text-lg mb-10 max-w-2xl mx-auto">
              Our infrastructure is complex, but using WabiSeminar is simple. 
              Check out our extensive FAQ or jump right in and host your first free meeting.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-8 py-4 rounded-2xl text-white font-bold transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 flex items-center justify-center"
              >
                <span>Try it now for free</span>
              </button>
              <button 
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl text-white font-bold transition-all hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <MessageSquare size={18} />
                <span>Read the FAQ</span>
              </button>
            </div>
          </motion.div>
        </section>

      </main>

      
      
    </div>
  );
}

