import { useState, useEffect } from 'react';
import { 
  Video, Search, ChevronDown, Mail, LifeBuoy,
  MessageSquare, Shield, CreditCard, Users, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Faq({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Meetings');
  const [openFaqId, setOpenFaqId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    { id: 'Meetings', icon: <Video size={18} /> },
    { id: 'Security', icon: <Shield size={18} /> },
    { id: 'Pricing', icon: <CreditCard size={18} /> },
    { id: 'Collaboration', icon: <Users size={18} /> },
    { id: 'Technical Support', icon: <Settings size={18} /> }
  ];

  const faqs = [
    { id: 'm1', category: 'Meetings', q: 'How do I start a meeting?', a: 'Just click "Start Instant Room" on your dashboard. A secure room will be generated instantly. You do not need to schedule anything in advance.' },
    { id: 'm2', category: 'Meetings', q: 'Can I join without an account?', a: 'Yes! Anyone with your secure meeting link can join directly from their browser without creating an account or downloading any software.' },
    { id: 'm3', category: 'Meetings', q: 'Is there a time limit on meetings?', a: 'No, all our meetings are completely unlimited. We do not cut off your calls after 40 minutes, even on the free plan.' },
    
    { id: 's1', category: 'Security', q: 'Are my meetings encrypted?', a: 'Yes, WabiSeminar uses WebRTC standard end-to-end encryption (E2EE) for all audio, video, and screen sharing data streams.' },
    { id: 's2', category: 'Security', q: 'What is a waiting room?', a: 'The waiting room allows the host to screen attendees. When someone tries to join, they are placed in the waiting room until the host explicitly clicks "Admit".' },
    
    { id: 'p1', category: 'Pricing', q: 'Is WabiSeminar really free?', a: 'Yes, our Starter plan is 100% free forever. It includes up to 4 participants with unlimited time and core features like screen sharing and chat.' },
    { id: 'p2', category: 'Pricing', q: 'Do you offer educational discounts?', a: 'Yes! We offer a 50% discount on Pro and Enterprise plans for verified educational institutions and non-profits. Contact sales to apply.' },
    
    { id: 'c1', category: 'Collaboration', q: 'How does screen sharing work?', a: 'Click the monitor icon in the bottom meeting control bar. Your browser will ask you to choose whether to share your entire screen, a specific application window, or a single browser tab.' },
    { id: 'c2', category: 'Collaboration', q: 'Is the chat history saved?', a: 'For your privacy and security, all in-meeting chat history is permanently deleted from our servers the moment the meeting ends.' },
    
    { id: 't1', category: 'Technical Support', q: "My camera or microphone isn't working.", a: "Please ensure your browser has permission to access your camera and microphone. You can check this by clicking the 'lock' icon next to the URL in your browser's address bar and ensuring permissions are set to 'Allow'." },
    { id: 't2', category: 'Technical Support', q: 'What browsers do you support?', a: 'WabiSeminar supports all modern WebRTC-enabled browsers including Chrome, Safari, Firefox, Edge, and Brave on both desktop and mobile devices.' }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = searchQuery ? true : faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#050816] text-white font-sans overflow-x-hidden relative">
      {/* Background Animated Blobs */}
      <div className="fixed bg-blue-600/10 blur-[150px] w-[800px] h-[800px] rounded-full top-[-10%] right-[-10%] pointer-events-none"></div>
      <div className="fixed bg-indigo-600/10 blur-[150px] w-[600px] h-[600px] rounded-full bottom-[-10%] left-[-10%] pointer-events-none"></div>

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
          <button onClick={() => { onNavigate('pricing'); window.history.pushState({}, '', '/pricing'); }} className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors">
            Pricing
          </button>
          <span className="text-sm font-semibold text-purple-300 bg-purple-600/20 px-6 py-2 rounded-full border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.15)] transition-all">
            FAQ
          </span>
        </nav>

        <button 
          className="flex items-center space-x-2 text-sm font-semibold text-white bg-white/10 border border-white/10 px-5 py-2.5 rounded-full hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          onClick={() => onNavigate('dashboard')}
        >
          Go to Dashboard
        </button>
      </header>

      <main className="flex-1 pt-32 lg:pt-40 relative z-10">
        
        {/* 1. HERO & SEARCH SECTION */}
        <section className="px-6 lg:px-8 xl:px-16 pb-16 text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-semibold mb-8 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <LifeBuoy size={16} className="text-blue-400" />
              <span>Help Center</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
              How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">help you?</span>
            </h1>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto leading-relaxed mb-12">
              Search our knowledge base or browse categories below to find answers to your questions about WabiSeminar.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-[#94A3B8]">
                <Search size={22} />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..." 
                className="w-full bg-[#0A0F24]/80 backdrop-blur-xl border border-white/10 rounded-full pl-16 pr-6 py-5 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]" 
              />
            </div>
          </motion.div>
        </section>

        {/* 2. FAQ CATEGORIES & ACCORDIONS */}
        <section className="px-6 lg:px-8 xl:px-16 pb-32 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar Categories */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-4 space-y-2">
              <h3 className="font-bold text-lg mb-6 text-white tracking-wide">Categories</h3>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery('');
                    setOpenFaqId(null);
                  }}
                  className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 font-medium ${
                    !searchQuery && activeCategory === cat.id
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/5 text-indigo-300 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                      : 'bg-transparent text-[#94A3B8] border border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={`${!searchQuery && activeCategory === cat.id ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {cat.icon}
                  </span>
                  <span>{cat.id}</span>
                </button>
              ))}
            </motion.div>

            {/* Accordion Area */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="lg:col-span-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {searchQuery ? `Search results for "${searchQuery}"` : activeCategory}
                </h2>
                {filteredFaqs.length === 0 && (
                  <p className="text-[#94A3B8] mt-4">No results found. Please try a different search term or browse the categories.</p>
                )}
              </div>

              <div className="space-y-4">
                {filteredFaqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div 
                      key={faq.id} 
                      className={`bg-[#0A0F24]/60 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 border ${
                        isOpen ? 'border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.15)]' : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <button 
                        className="w-full px-6 py-6 text-left flex justify-between items-center focus:outline-none group"
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      >
                        <span className={`font-semibold text-lg transition-colors pr-8 ${isOpen ? 'text-indigo-300' : 'text-white group-hover:text-indigo-200'}`}>
                          {faq.q}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-[#94A3B8] group-hover:bg-white/10'}`}>
                          <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="px-6 pb-6 text-[#94A3B8] text-base leading-relaxed"
                          >
                            <div className="pt-2 border-t border-white/5 mt-2">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>

          </div>
        </section>

        {/* 3. CONTACT SUPPORT CTA */}
        <section className="py-24 px-6 lg:px-8 xl:px-16 mb-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto bg-gradient-to-tr from-[#0A0F24] to-[#160B2A] border border-white/10 rounded-[3rem] p-12 lg:p-16 text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
            
            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
               <MessageSquare size={32} className="text-indigo-400" />
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight">Can't find what you're looking for?</h2>
            <p className="text-lg text-[#94A3B8] mb-10 max-w-2xl mx-auto">
              Our support team is online 24/7. Drop us a message and we'll get back to you within 2 hours.
            </p>
            
            <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-indigo-400 hover:to-purple-400 transition-all shadow-[0_10px_30px_rgba(124,58,237,0.4)] flex items-center space-x-3 mx-auto hover:-translate-y-1">
              <Mail size={20} />
              <span>Contact Support</span>
            </button>
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
