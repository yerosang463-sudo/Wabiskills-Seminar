export default function Dashboard({ onNavigate }) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Top Navbar */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
        <div className="font-semibold text-gray-800">WabiSeminar</div>
        <button 
          className="text-sm text-gray-500 hover:text-gray-800"
          onClick={() => onNavigate('auth')}
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="wf-card w-full max-w-md p-8 flex flex-col items-center space-y-8">
          <h2 className="text-xl font-medium text-gray-800">Welcome</h2>
          
          <button 
            className="wf-btn wf-btn-primary w-full py-3"
            onClick={() => onNavigate('meeting')}
          >
            Create Room
          </button>
          
          <div className="w-full relative flex items-center justify-center">
            <div className="w-full h-px bg-gray-200"></div>
            <span className="absolute bg-white px-3 text-xs text-gray-400">or join existing</span>
          </div>

          <div className="w-full space-y-3">
            <input type="text" placeholder="Enter Room ID" className="wf-input text-center" />
            <button 
              className="wf-btn wf-btn-secondary w-full"
              onClick={() => onNavigate('meeting')}
            >
              Join Room
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
