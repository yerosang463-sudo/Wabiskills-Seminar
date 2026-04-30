import { useState } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import MeetingRoom from './components/MeetingRoom';

function App() {
  const [currentView, setCurrentView] = useState('auth');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {currentView === 'auth' && <Auth onNavigate={setCurrentView} />}
      {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
      {currentView === 'meeting' && <MeetingRoom onNavigate={setCurrentView} />}
    </div>
  );
}

export default App;
