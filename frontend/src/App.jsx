import { useState, useLayoutEffect, useEffect, useCallback } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MeetingRoom from './components/MeetingRoom';
import { roomIdFromPathname } from './routeUtils.js';

function App() {
  const [currentView, setCurrentView] = useState('auth');
  const [currentRoomId, setCurrentRoomId] = useState('');

  const syncRouteFromLocation = useCallback(() => {
    const roomId = roomIdFromPathname(window.location.pathname);
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const authed = Boolean(token && username);

    if (roomId) {
      setCurrentRoomId(roomId);
      setCurrentView(authed ? 'meeting' : 'auth');
      return;
    }

    setCurrentRoomId('');
    setCurrentView(authed ? 'dashboard' : 'auth');
  }, []);

  useLayoutEffect(() => {
    syncRouteFromLocation();
  }, [syncRouteFromLocation]);

  useEffect(() => {
    const onPop = () => syncRouteFromLocation();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [syncRouteFromLocation]);

  const navigateToRoom = (roomId) => {
    setCurrentRoomId(roomId);
    setCurrentView('meeting');
    window.history.pushState({}, '', `/room/${roomId}`);
  };

  const leaveRoom = () => {
    setCurrentRoomId('');
    setCurrentView('dashboard');
    window.history.pushState({}, '', '/');
  };

  const handleAuthSuccess = () => {
    const roomId = roomIdFromPathname(window.location.pathname) || currentRoomId;
    if (roomId) {
      setCurrentRoomId(roomId);
      setCurrentView('meeting');
      window.history.pushState({}, '', `/room/${roomId}`);
    } else {
      setCurrentView('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {currentView === 'auth' && <Auth onNavigate={handleAuthSuccess} />}
      {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} onJoinRoom={navigateToRoom} />}
      {currentView === 'meeting' && <MeetingRoom onLeave={leaveRoom} roomId={currentRoomId} />}
    </div>
  );
}

export default App;
