/**
 * Main App component for Pickup!
 */

import { SessionProvider } from './store/SessionContext';
import './App.css';

function App() {
  return (
    <SessionProvider>
      <div className="app">
        <header className="app-header">
          <h1>🏀 Pickup!</h1>
          <p>3v3 Game Scheduling & Rotation Manager</p>
        </header>
        
        <main className="app-main">
          <div className="welcome-message">
            <h2>Welcome to Pickup!</h2>
            <p>Your app is initialized and ready for development.</p>
            <div className="info-box">
              <h3>✅ What's ready:</h3>
              <ul>
                <li>React + TypeScript with Vite</li>
                <li>Core data models (Session, Player, Game, BigToss)</li>
                <li>State management with Context API</li>
                <li>localStorage persistence</li>
                <li>Team generation algorithm</li>
                <li>Referee selection logic</li>
              </ul>
              
              <h3>📋 Next steps:</h3>
              <ul>
                <li>Build UI components (SessionToolbar, PlayerList, etc.)</li>
                <li>Implement filled game logic</li>
                <li>Add statistics and fairness tracking</li>
                <li>Create responsive layout</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}

export default App;
