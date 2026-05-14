import { useState, useEffect, useCallback, useRef } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MeetingRoom from './components/MeetingRoom';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Faq from './components/Faq';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AnimatePresence, motion } from 'framer-motion';
import { roomIdFromPathname } from './routeUtils.js';

function readRouteSnapshot() {
  const roomId = roomIdFromPathname(window.location.pathname);
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const authed = Boolean(token && username);

  if (roomId) {
    return {
      currentRoomId: roomId,
      currentView: authed ? 'meeting' : 'auth',
    };
  }

  if (window.location.pathname === '/features') {
    return {
      currentRoomId: '',
      currentView: 'features',
    };
  }

  if (window.location.pathname === '/how-it-works') {
    return {
      currentRoomId: '',
      currentView: 'how-it-works',
    };
  }

  if (window.location.pathname === '/pricing') {
    return {
      currentRoomId: '',
      currentView: 'pricing',
    };
  }

  if (window.location.pathname === '/faq') {
    return {
      currentRoomId: '',
      currentView: 'faq',
    };
  }

  return {
    currentRoomId: '',
    currentView: 'dashboard', // Always show dashboard as landing page
  };
}

function App() {
  const [routeState, setRouteState] = useState(readRouteSnapshot);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const { currentView, currentRoomId } = routeState;

  const setCurrentView = (currentView) => {
    setRouteState((prev) => ({ ...prev, currentView }));
  };

  const syncRouteFromLocation = useCallback(() => {
    setRouteState(readRouteSnapshot());
  }, []);

  useEffect(() => {
    const onPop = () => syncRouteFromLocation();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [syncRouteFromLocation]);

  const navigateToRoom = (roomId) => {
    setRouteState({ currentRoomId: roomId, currentView: 'meeting' });
    window.history.pushState({}, '', `/meeting/${roomId}`);
  };

  const leaveRoom = () => {
    setRouteState({ currentRoomId: '', currentView: 'dashboard' });
    window.history.pushState({}, '', '/');
  };

  const handleAuthSuccess = () => {
    const roomId = roomIdFromPathname(window.location.pathname) || currentRoomId;
    if (roomId) {
      setRouteState({ currentRoomId: roomId, currentView: 'meeting' });
      window.history.pushState({}, '', `/meeting/${roomId}`);
    } else {
      setRouteState({ currentRoomId: '', currentView: 'dashboard' });
    }
  };

  const notify = useCallback((type, message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 3600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const isMarketing = ['dashboard', 'features', 'how-it-works', 'pricing', 'faq'].includes(currentView);

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.history.pushState({}, '', view === 'dashboard' ? '/' : `/${view}`);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#050816] text-white overflow-x-hidden relative">
      {/* Global Background Blobs for Marketing Pages */}
      {isMarketing && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute bg-indigo-600/10 blur-[150px] w-[800px] h-[800px] rounded-full top-[-10%] right-[-10%]"></div>
          <div className="absolute bg-fuchsia-600/10 blur-[150px] w-[600px] h-[600px] rounded-full bottom-[-10%] left-[-10%]"></div>
        </div>
      )}

      {/* Global Navbar */}
      {isMarketing && <Navbar currentView={currentView} onNavigate={handleNavigate} />}

      <main className="flex-1 relative z-10 flex flex-col">
        {currentView === 'auth' && <Auth onNavigate={handleAuthSuccess} />}
        {currentView === 'meeting' && <MeetingRoom onLeave={leaveRoom} roomId={currentRoomId} notify={notify} />}
        
        {isMarketing && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} onJoinRoom={navigateToRoom} notify={notify} />}
              {currentView === 'features' && <Features onNavigate={handleNavigate} />}
              {currentView === 'how-it-works' && <HowItWorks onNavigate={handleNavigate} />}
              {currentView === 'pricing' && <Pricing onNavigate={handleNavigate} />}
              {currentView === 'faq' && <Faq onNavigate={handleNavigate} />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Global Footer */}
      {isMarketing && <Footer onNavigate={handleNavigate} />}

      {toast && (
        <div className="fixed top-4 left-1/2 z-[100] w-[min(calc(100vw-2rem),28rem)] -translate-x-1/2">
          <div
            className={`rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md ${
              toast.type === 'error'
                ? 'border-red-500/30 bg-red-950/80 text-red-100'
                : 'border-emerald-500/30 bg-emerald-950/80 text-emerald-100'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
