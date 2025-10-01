/**
 * Main App component for Pickup!
 */

import { SessionProvider } from './store/SessionContext';
import './index.css';
import SessionToolbar from './components/Session/SessionToolbar';
import SessionSummary from './components/Session/SessionSummary';

function App() {
  return (
    <SessionProvider>
      <div className="min-h-screen text-white">
        <header className="px-6 py-8 text-center bg-black/20 backdrop-blur-md shadow-md">
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow">🏀 Pickup!</h1>
          <p className="text-white/90 mt-2">3v3 Game Scheduling & Rotation Manager</p>
        </header>

        <main className="max-w-5xl mx-auto p-6">
          <div className="bg-white/95 text-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-indigo-600">Session</h2>
              <SessionToolbar />
            </div>

            <div className="space-y-4">
              <SessionSummary />
              <div className="border-l-4 border-indigo-500 bg-gray-50 rounded-md p-4">
                <h3 className="text-indigo-600 font-semibold mb-2">What's ready</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>React + TypeScript with Vite</li>
                  <li>Core data models (Session, Player, Game, BigToss)</li>
                  <li>State management with Context API</li>
                  <li>localStorage persistence</li>
                  <li>Team generation algorithm</li>
                  <li>Referee selection logic</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}

export default App;
