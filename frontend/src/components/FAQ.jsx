import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Shield, DollarSign, Users, Wrench, Search, 
  ChevronDown, MessageCircle, Mail, HelpCircle, ArrowRight
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

const faqData = [
  {
    category: "Meetings",
    icon: <Video size={20} className="text-indigo-400" />,
    colorClass: "indigo",
    questions: [
      { q: "How do I create an instant meeting room?", a: "Simply log into your dashboard and click 'Create Instant Room'. A unique, secure link will be generated instantly that you can share with your participants." },
      { q: "Is there a limit on how many people can join?", a: "Our free plan supports up to 10 participants. For larger masterclasses, our Pro and Enterprise plans support 100 to 1,000+ simultaneous participants." },
      { q: "Can participants join without an account?", a: "Yes! Your guests simply click the link you share and they can join the session directly from their browser without downloading any software or creating an account." }
    ]
  },
  {
    category: "Security",
    icon: <Shield size={20} className="text-emerald-400" />,
    colorClass: "emerald",
    questions: [
      { q: "Is my meeting data encrypted?", a: "Yes, all audio, video, and text chat streams are protected by industry-standard AES-256 end-to-end encryption." },
      { q: "How can I prevent uninvited guests?", a: "Hosts have access to a robust waiting room feature. You can screen participants before admitting them or lock the room once everyone has arrived." },
      { q: "Are meeting recordings secure?", a: "Cloud recordings are stored in encrypted vaults. Only the host can access, download, or share the recording links." }
    ]
  },
  {
    category: "Pricing",
    icon: <DollarSign size={20} className="text-purple-400" />,
    colorClass: "purple",
    questions: [
      { q: "Is the platform really free?", a: "Yes! Our core platform is 100% free forever for up to 10 participants. You only pay if you need advanced features or larger room capacities." },
      { q: "Can I cancel my paid subscription at any time?", a: "Absolutely. We don't believe in lock-in contracts. You can downgrade or cancel your subscription directly from your billing dashboard." },
      { q: "Do you offer annual discounts?", a: "Yes, you save 20% on all premium plans when you choose annual billing instead of monthly." }
    ]
  },
  {
    category: "Collaboration",
    icon: <Users size={20} className="text-pink-400" />,
    colorClass: "pink",
    questions: [
      { q: "Can I share my screen?", a: "Yes, you can share your entire desktop, specific application windows, or single browser tabs with zero latency." },
      { q: "Is there a whiteboard feature?", a: "We are actively developing a collaborative whiteboard feature that will be rolled out to all users in the next major update." },
      { q: "Can I share files in the chat?", a: "Currently, you can share links to files in the real-time chat. Direct file uploading is available on Pro and Enterprise tiers." }
    ]
  },
  {
    category: "Technical Support",
    icon: <Wrench size={20} className="text-blue-400" />,
    colorClass: "blue",
    questions: [
      { q: "What browsers are supported?", a: "WabiSeminar works flawlessly on all modern browsers including Chrome, Edge, Safari, and Firefox. No plugins required." },
      { q: "Why is my camera not working?", a: "Ensure that your browser has permission to access your camera and microphone. You can reset these permissions by clicking the lock icon next to the URL bar." },
      { q: "How do I report a bug?", a: "You can reach out directly to our technical team via the Contact Support button below, and we'll investigate the issue immediately." }
    ]
  }
];

const AccordionItem = ({ q, a, isOpen, onClick }) => {
  return (
    <div className="border border-white/5 rounded-2xl mb-4 bg-[#0A0F24]/60 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:bg-[#0A0F24]/80 hover:shadow-[0_10px_30px_-15px_rgba(99,102,241,0.2)]">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
      >
        <h4 className="text-lg font-semibold text-white pr-8 group-hover:text-indigo-300 transition-colors">{q}</h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-[#94A3B8] border border-white/5'}`}
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="p-6 pt-0 text-[#94A3B8] leading-relaxed border-t border-white/5 mt-2">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter logic
  const filteredData = faqData.map(category => {
    const filteredQuestions = category.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, questions: filteredQuestions };
  }).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-[#050816] text-white font-sans overflow-hidden relative">
      {/* Background Animated Blobs */}
      <div className="fixed bg-blue-600/10 blur-[150px] w-[800px] h-[800px] rounded-full top-[-10%] right-[-10%] pointer-events-none"></div>
      <div className="fixed bg-purple-600/10 blur-[150px] w-[600px] h-[600px] rounded-full bottom-[-20%] left-[-10%] pointer-events-none"></div>

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

      <main className="pt-32 lg:pt-40 pb-20 relative z-10 max-w-[1000px] mx-auto px-6 lg:px-8">
        
        {/* 1. Hero Section */}
        <section className="text-center mb-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 w-fit text-sm font-semibold shadow-[0_0_15px_rgba(59,130,246,0.15)] mb-8">
              <HelpCircle size={16} className="text-blue-400" />
              <span>Support Center</span>
            </motion.div>
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]">
              How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">help you?</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-[#94A3B8] leading-relaxed max-w-2xl font-light mb-12">
              Browse our most frequently asked questions or search for a specific topic to get the answers you need immediately.
            </motion.p>
          </motion.div>
        </section>

        {/* 2. Search Bar */}
        <section className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-2xl mx-auto group"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:opacity-100 transition-opacity opacity-50 z-0"></div>
             <div className="relative z-10 flex items-center bg-[#0A0F24]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500/50 transition-colors">
                <div className="pl-4 pr-2 text-[#94A3B8]">
                   <Search size={24} />
                </div>
                <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search for answers..." 
                   className="w-full bg-transparent border-none outline-none text-white text-lg py-3 placeholder:text-slate-600"
                />
                {searchQuery && (
                   <button 
                     onClick={() => setSearchQuery('')}
                     className="pr-4 text-[#94A3B8] hover:text-white transition-colors"
                   >
                      Clear
                   </button>
                )}
             </div>
          </motion.div>
        </section>

        {/* 3. Accordion Categories */}
        <section className="mb-32">
           {filteredData.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="text-center py-20 bg-[#0A0F24]/40 rounded-[2rem] border border-white/5"
              >
                 <Search size={48} className="mx-auto text-slate-600 mb-6" />
                 <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
                 <p className="text-[#94A3B8]">We couldn't find any questions matching "{searchQuery}".</p>
              </motion.div>
           ) : (
              <div className="space-y-16">
                 {filteredData.map((category, catIdx) => (
                    <motion.div 
                      key={category.category}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                    >
                       <div className="flex items-center space-x-4 mb-8 pl-2">
                          <div className={`w-12 h-12 rounded-xl bg-${category.colorClass}-500/10 flex items-center justify-center border border-${category.colorClass}-500/20 shadow-[0_0_15px_rgba(var(--${category.colorClass}-rgb),0.1)]`}>
                             {category.icon}
                          </div>
                          <h2 className="text-3xl font-extrabold text-white">{category.category}</h2>
                       </div>
                       
                       <div className="space-y-4">
                          {category.questions.map((item, qIdx) => (
                             <AccordionItem 
                               key={qIdx} 
                               q={item.q} 
                               a={item.a} 
                               isOpen={!!openItems[`${catIdx}-${qIdx}`]}
                               onClick={() => toggleItem(catIdx, qIdx)}
                             />
                          ))}
                       </div>
                    </motion.div>
                 ))}
              </div>
           )}
        </section>

        {/* 4. Contact Support CTA */}
        <section className="mb-20">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="bg-gradient-to-br from-[#160B2A] to-[#0A0F24] border border-purple-500/20 rounded-[3rem] p-12 md:p-16 text-center shadow-[0_30px_60px_-15px_rgba(168,85,247,0.2)] relative overflow-hidden group"
           >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 group-hover:opacity-10 transition-opacity"></div>
              
              <div className="relative z-10">
                 <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                    <MessageCircle size={36} className="text-indigo-400" />
                 </div>
                 <h2 className="text-4xl font-extrabold text-white mb-6">Still need help?</h2>
                 <p className="text-[#94A3B8] text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                    Our technical support team is available 24/7. Drop us a message and we'll get back to you within a few hours.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold py-4 px-8 rounded-xl shadow-[0_10px_20px_-10px_rgba(99,102,241,0.6)] flex items-center justify-center space-x-3 transition-colors hover:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.8)]"
                    >
                       <Mail size={20} />
                       <span>Contact Support</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onNavigate('dashboard')}
                      className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-xl border border-white/10 flex items-center justify-center space-x-3 transition-colors hover:border-white/20 group"
                    >
                       <span>Return to Dashboard</span>
                       <ArrowRight size={20} className="text-[#94A3B8] group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                 </div>
              </div>
           </motion.div>
        </section>

      </main>
    </div>
  );
}
