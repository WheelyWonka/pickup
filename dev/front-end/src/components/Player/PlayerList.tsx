import React, { useState } from 'react';
import { useSession } from '../../store/SessionContext';

const PlayerList: React.FC = () => {
  const { state, addPlayer, removePlayer, togglePlayerAvailability } = useSession();
  const [newPlayerName, setNewPlayerName] = useState('');

  const session = state.session;
  if (!session) return null;

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlayerName.trim();
    if (!name) return;

    addPlayer(name);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (playerId: string, playerName: string) => {
    const confirmed = window.confirm(
      `Remove "${playerName}" from the session? This will also remove them from any scheduled games.`
    );
    if (confirmed) {
      removePlayer(playerId);
    }
  };

  const handleToggleAvailability = (playerId: string) => {
    togglePlayerAvailability(playerId);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-orange-200/30 rounded-2xl shadow-lg overflow-hidden">
      <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-b border-orange-200/20">
        <h3 className="font-bold text-gray-900 text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Player Roster ({session.players.length})</h3>
      </div>
      
      {/* Add Player Input */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-orange-50/30 to-pink-50/30 border-b border-orange-200/20">
        <form onSubmit={handleAddPlayer} className="flex gap-3">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Enter player name..."
            className="flex-1 px-4 py-2.5 text-sm border border-orange-200/50 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-400 transition-all duration-200"
            maxLength={50}
          />
          <button
            type="submit"
            disabled={!newPlayerName.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">Add</span>
          </button>
        </form>
        
        {state.error && (
          <div className="text-red-600 text-sm bg-red-50/80 border border-red-200/50 rounded-lg px-3 py-2 mt-3 backdrop-blur-sm">
            {state.error}
          </div>
        )}
      </div>
      
      {/* Player List */}
      <div className="divide-y divide-orange-100/50">
        {session.players.length === 0 ? (
          <div className="px-4 py-8 sm:px-6 sm:py-12 text-center text-gray-500">
            <div className="text-orange-400 mb-3">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="font-medium text-sm sm:text-base">No players added yet</p>
            <p className="text-xs sm:text-sm mt-1">Add players to start building your roster</p>
          </div>
        ) : (
          session.players.map((player, index) => (
            <div key={player.id} className={`px-4 py-3 sm:px-6 sm:py-4 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-pink-50/50 transition-all duration-200 ${
              index % 2 === 0 ? 'bg-white/50' : 'bg-orange-50/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleAvailability(player.id)}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-sm flex-shrink-0 transition-all duration-200 border-2 ${
                      player.available 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 border-green-300' 
                        : 'bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 border-gray-200'
                    }`}
                    title={player.available ? 'Mark as unavailable' : 'Mark as available'}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm sm:text-base truncate">
                        {player.name}
                      </span>
                      {!player.active && (
                        <span className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200/50 font-semibold">
                          Inactive
                        </span>
                      )}
                      {!player.available && (
                        <span className="text-xs bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800 px-2 py-0.5 rounded-full border border-orange-200/50 font-semibold">
                          Unavailable
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      Joined {new Date(player.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRemovePlayer(player.id, player.name)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/80 rounded-lg transition-all duration-200"
                  title="Remove player"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlayerList;
