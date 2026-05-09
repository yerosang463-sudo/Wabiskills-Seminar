import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MeetingRoom from './components/MeetingRoom';

function App() {
  const [currentView, setCurrentView] = useState('auth');
  const [currentRoomId, setCurrentRoomId] = useState('');

  // Check for room ID in URL on initial load
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    if (pathParts[1] === 'room' && pathParts[2]) {
      const roomId = pathParts[2];
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      
      if (token && username) {
        // User is authenticated, join room directly
        setCurrentRoomId(roomId);
        setCurrentView('meeting');
      } else {
        // User needs to authenticate first
        setCurrentRoomId(roomId);
        setCurrentView('auth');
      }
    }
  }, []);

  const navigateToRoom = (roomId) => {
    setCurrentRoomId(roomId);
    setCurrentView('meeting');
    // Update URL
    window.history.pushState({}, '', `/room/${roomId}`);
  };

  const leaveRoom = () => {
    setCurrentRoomId('');
    setCurrentView('dashboard');
    // Update URL
    window.history.pushState({}, '', '/');
  };

  const handleAuthSuccess = () => {
    if (currentRoomId) {
      // User was trying to join a room, now redirect to it
      setCurrentView('meeting');
      window.history.pushState({}, '', `/room/${currentRoomId}`);
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
