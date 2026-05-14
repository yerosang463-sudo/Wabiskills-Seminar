import { useState, useEffect, useCallback, useRef } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MeetingRoom from './components/MeetingRoom';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Faq from './components/Faq';
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

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {currentView === 'auth' && <Auth onNavigate={handleAuthSuccess} />}
      {currentView === 'dashboard' && (
        <Dashboard onNavigate={setCurrentView} onJoinRoom={navigateToRoom} notify={notify} />
      )}
      {currentView === 'features' && <Features onNavigate={(view) => {
        setCurrentView(view);
        window.history.pushState({}, '', view === 'dashboard' ? '/' : `/${view}`);
      }} />}
      {currentView === 'how-it-works' && <HowItWorks onNavigate={(view) => {
        setCurrentView(view);
        window.history.pushState({}, '', view === 'dashboard' ? '/' : `/${view}`);
      }} />}
      {currentView === 'pricing' && <Pricing onNavigate={(view) => {
        setCurrentView(view);
        window.history.pushState({}, '', view === 'dashboard' ? '/' : `/${view}`);
      }} />}
      {currentView === 'faq' && <Faq onNavigate={(view) => {
        setCurrentView(view);
        window.history.pushState({}, '', view === 'dashboard' ? '/' : `/${view}`);
      }} />}
      {currentView === 'meeting' && <MeetingRoom onLeave={leaveRoom} roomId={currentRoomId} notify={notify} />}

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
