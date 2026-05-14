import { useState, useEffect } from 'react';
import { 
  Video, Check, Shield, Zap, HelpCircle, 
  ChevronDown, Building2, Crown, Sparkles, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Pricing({ onNavigate }) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const faqs = [
    {
      q: "Can I use WabiSeminar for free forever?",
      a: "Yes! Our Free plan includes unlimited 1-on-1 meetings, screen sharing, and real-time chat. It's completely free forever with no credit card required."
    },
    {
      q: "What counts as a 'participant'?",
      a: "A participant is anyone who joins your meeting room, including the host. So if you host a webinar with 50 guests, that counts as 51 participants."
    },
    {
      q: "Can I switch from monthly to annual billing?",
      a: "Absolutely. You can upgrade to annual billing at any time from your account settings to take advantage of the 20% discount."
    },
    {
      q: "Do guests need to create an account to join?",
      a: "No. Guests can join instantly via your secure link directly from their browser without creating an account or downloading any software."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#050816] text-white font-sans overflow-x-hidden relative">
      {/* Background Animated Blobs */}
      <div className="fixed bg-indigo-600/10 blur-[150px] w-[600px] h-[600px] rounded-full top-[-10%] right-[-10%] pointer-events-none"></div>
      <div className="fixed bg-fuchsia-600/10 blur-[150px] w-[600px] h-[600px] rounded-full bottom-[-10%] left-[-10%] pointer-events-none"></div>

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
          <button onClick={() => { onNavigate('features'); window.history.pushState({}, '', '/features'); }} className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">
            Features
          </button>
          <button onClick={() => { onNavigate('how-it-works'); window.history.pushState({}, '', '/how-it-works'); }} className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">
            How It Works
          </button>
          <span className="text-sm font-semibold text-purple-300 bg-purple-600/20 px-6 py-2 rounded-full border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.15)] transition-all">
            Pricing
          </span>
        </nav>

        <button 
          className="flex items-center space-x-2 text-sm font-semibold text-white bg-white/10 border border-white/10 px-5 py-2.5 rounded-full hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          onClick={() => onNavigate('dashboard')}
        >
          Get Started Free
        </button>
      </header>

      <main className="flex-1 pt-32 lg:pt-40 relative z-10">
        
        {/* HERO SECTION */}
        <section className="px-6 lg:px-8 xl:px-16 pb-20 text-center max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Simple pricing for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400">limitless potential</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-[#94A3B8] text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              Start for free, upgrade when you need more power. Transparent pricing with no hidden fees and no credit card required to start.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div variants={itemVariants} className="flex items-center justify-center space-x-4 mb-16">
              <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-white' : 'text-[#94A3B8]'}`}>Monthly</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-16 h-8 rounded-full bg-[#1E113C] border border-purple-500/30 p-1 flex items-center transition-colors"
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md transform transition-transform duration-300 ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}></div>
              </button>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-white' : 'text-[#94A3B8]'}`}>Annually</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Save 20%</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* PRICING CARDS */}
        <section className="px-6 lg:px-8 xl:px-16 pb-32 max-w-[1300px] mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-center"
          >
            {/* FREE PLAN */}
            <motion.div variants={itemVariants} className="bg-[#0A0F24]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col hover:-translate-y-2 transition-transform duration-300">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-300 mb-2">Starter</h3>
                <p className="text-sm text-[#94A3B8]">Perfect for individuals and small teams starting out.</p>
              </div>
              <div className="mb-8">
                <div className="flex items-end space-x-1">
                  <span className="text-5xl font-extrabold text-white">$0</span>
                  <span className="text-[#94A3B8] mb-1">/ forever</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {['Up to 4 participants', 'Unlimited meeting duration', 'HD Video (720p)', 'Basic screen sharing', 'End-to-end encryption'].map((feat, i) => (
                  <li key={i} className="flex items-start space-x-3 text-sm text-slate-300">
                    <Check size={18} className="text-indigo-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => onNavigate('dashboard')} className="w-full py-4 rounded-xl font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                Get Started Free
              </button>
            </motion.div>

            {/* PRO PLAN (RECOMMENDED) */}
            <motion.div variants={itemVariants} className="relative transform md:scale-110 z-10">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500 via-purple-500 to-fuchsia-500 rounded-[2.5rem] p-[2px] opacity-100 animate-[pulse_4s_ease-in-out_infinite]">
                 <div className="absolute inset-0 blur-xl bg-gradient-to-b from-indigo-500 via-purple-500 to-fuchsia-500 opacity-30"></div>
              </div>
              <div className="bg-[#0B0A1E] backdrop-blur-2xl rounded-[2.5rem] p-10 flex flex-col relative h-full shadow-[0_20px_50px_-20px_rgba(124,58,237,0.5)]">
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg flex items-center space-x-1">
                  <Crown size={12} />
                  <span>Most Popular</span>
                </div>
                <div className="mb-8 mt-2">
                  <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                  <p className="text-sm text-[#94A3B8]">For educators, creators, and growing businesses.</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-end space-x-1">
                    <span className="text-5xl font-extrabold text-white">${isAnnual ? '12' : '15'}</span>
                    <span className="text-[#94A3B8] mb-1">/ user / month</span>
                  </div>
                  {isAnnual && <p className="text-xs text-emerald-400 mt-2">Billed annually ($144/yr)</p>}
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-start space-x-3 text-sm text-white font-medium">
                    <Check size={18} className="text-purple-400 shrink-0" />
                    <span>Everything in Starter, plus:</span>
                  </li>
                  {['Up to 100 participants', 'Ultra HD Video (4K ready)', 'Advanced screen sharing & recording', 'Waiting rooms & host controls', 'Priority email support'].map((feat, i) => (
                    <li key={i} className="flex items-start space-x-3 text-sm text-slate-300">
                      <Check size={18} className="text-purple-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => onNavigate('dashboard')} className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 shadow-[0_10px_20px_-10px_rgba(124,58,237,0.6)] transition-all hover:-translate-y-1">
                  Upgrade to Pro
                </button>
              </div>
            </motion.div>

            {/* ENTERPRISE PLAN */}
            <motion.div variants={itemVariants} className="bg-[#0A0F24]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col hover:-translate-y-2 transition-transform duration-300">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-300 mb-2">Enterprise</h3>
                <p className="text-sm text-[#94A3B8]">Custom solutions for large organizations and schools.</p>
              </div>
              <div className="mb-8">
                <div className="flex items-end space-x-1">
                  <span className="text-5xl font-extrabold text-white">Custom</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start space-x-3 text-sm text-white font-medium">
                  <Check size={18} className="text-indigo-400 shrink-0" />
                  <span>Everything in Pro, plus:</span>
                </li>
                {['Up to 1,000 participants', 'Custom domain & branding', 'Single Sign-On (SSO)', 'Dedicated account manager', '24/7 Phone support', 'Advanced analytics API'].map((feat, i) => (
                  <li key={i} className="flex items-start space-x-3 text-sm text-slate-300">
                    <Check size={18} className="text-indigo-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-xl font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all">
                Contact Sales
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* TRUST BADGES */}
        <section className="border-y border-white/5 bg-white/[0.01] py-10 relative z-10 backdrop-blur-sm mb-32">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 text-[#94A3B8]">
            <div className="flex items-center space-x-3">
              <Shield size={24} className="text-emerald-400"/>
              <span className="font-semibold text-sm">SOC 2 Type II Certified</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-white/20"></div>
            <div className="flex items-center space-x-3">
              <Zap size={24} className="text-indigo-400"/>
              <span className="font-semibold text-sm">99.99% Uptime Guarantee</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-white/20"></div>
            <div className="flex items-center space-x-3">
              <Building2 size={24} className="text-purple-400"/>
              <span className="font-semibold text-sm">GDPR Compliant</span>
            </div>
          </div>
        </section>

        {/* FEATURE COMPARISON TABLE */}
        <section className="px-6 lg:px-8 xl:px-16 pb-32 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Compare all features</h2>
            <p className="text-[#94A3B8]">Find the perfect plan for your specific needs.</p>
          </div>

          <div className="bg-[#0A0F24]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-6 font-semibold text-slate-300 w-1/3">Core Features</th>
                    <th className="p-6 font-bold text-white text-center">Starter</th>
                    <th className="p-6 font-bold text-purple-300 text-center bg-purple-500/10">Professional</th>
                    <th className="p-6 font-bold text-white text-center">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  {[
                    { name: 'Max Participants', s: '4', p: '100', e: '1000' },
                    { name: 'Meeting Duration', s: 'Unlimited', p: 'Unlimited', e: 'Unlimited' },
                    { name: 'Video Quality', s: '720p HD', p: '4K Ultra HD', e: '4K Ultra HD' },
                    { name: 'Screen Sharing', s: true, p: true, e: true },
                    { name: 'Cloud Recording', s: false, p: '100GB', e: 'Unlimited' },
                    { name: 'Waiting Rooms', s: false, p: true, e: true },
                    { name: 'Breakout Rooms', s: false, p: true, e: true },
                    { name: 'Custom Branding', s: false, p: false, e: true },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 text-slate-300">{row.name}</td>
                      <td className="p-6 text-center text-[#94A3B8]">
                        {typeof row.s === 'boolean' ? (row.s ? <Check size={18} className="mx-auto text-emerald-400"/> : <X size={18} className="mx-auto text-slate-600"/>) : row.s}
                      </td>
                      <td className="p-6 text-center text-purple-200 bg-purple-500/5">
                        {typeof row.p === 'boolean' ? (row.p ? <Check size={18} className="mx-auto text-purple-400"/> : <X size={18} className="mx-auto text-slate-600"/>) : row.p}
                      </td>
                      <td className="p-6 text-center text-[#94A3B8]">
                        {typeof row.e === 'boolean' ? (row.e ? <Check size={18} className="mx-auto text-indigo-400"/> : <X size={18} className="mx-auto text-slate-600"/>) : row.e}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="px-6 lg:px-8 xl:px-16 pb-32 max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-[#94A3B8]">Everything you need to know about billing and pricing.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#0A0F24]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
                <button 
                  className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-white">{faq.q}</span>
                  <ChevronDown size={20} className={`text-[#94A3B8] transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-5 text-[#94A3B8] text-sm leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
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
