/**
 * Main App component for Pickup!
 */

import { SessionProvider } from './store/SessionContext';
import './index.css';
import SessionToolbar from './components/Session/SessionToolbar';
import SessionSummary from './components/Session/SessionSummary';
import SessionDashboard from './components/Session/SessionDashboard';

function App() {
  return (
    <SessionProvider>
      <div className="min-h-screen text-gray-800">
        <header className="px-4 py-6 sm:px-6 sm:py-8 text-center">
          <div className="max-w-sm mx-auto sm:max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-none bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent [font-family:'Bungee_Inline',cursive] inline-flex items-center gap-3">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" viewBox="0 0 100 100" aria-hidden="true">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="46" fill="url(#logoGradient)" />
              </svg>
              Pickup!
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base md:text-lg font-medium">Game Scheduling & Referee Rotation Manager</p>
          </div>
        </header>

        <main className="max-w-sm mx-auto p-3 sm:max-w-2xl sm:p-4 md:max-w-4xl md:p-6">
          <div className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-orange-200/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Session Dashboard
                </h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your pickup games and players</p>
              </div>
              <div className="flex-shrink-0">
                <SessionToolbar />
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <SessionSummary />
              <SessionDashboard />
            </div>
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}

export default App;
