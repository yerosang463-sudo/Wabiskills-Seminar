import { useState } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MeetingRoom from './components/MeetingRoom';

function App() {
  const [currentView, setCurrentView] = useState('auth');
  const [currentRoomId, setCurrentRoomId] = useState('');

  const navigateToRoom = (roomId) => {
    setCurrentRoomId(roomId);
    setCurrentView('meeting');
  };

  const leaveRoom = () => {
    setCurrentRoomId('');
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {currentView === 'auth' && <Auth onNavigate={setCurrentView} />}
      {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} onJoinRoom={navigateToRoom} />}
      {currentView === 'meeting' && <MeetingRoom onLeave={leaveRoom} roomId={currentRoomId} />}
    </div>
  );
}

export default App;
