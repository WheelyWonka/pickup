import React, { useState } from 'react';
import { useSession } from '../../store/SessionContext';
import type { Player } from '../../types/models';

type TabType = 'players' | 'schedule' | 'stats';

const SessionDashboard: React.FC = () => {
  const { state } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('players');
  const session = state.session;

  if (!session) {
    return (
      <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-gray-600">
        <p>No active session. Create a session to view the dashboard.</p>
      </div>
    );
  }

  const activePlayers = session.players.filter(p => p.active && p.available);
  const currentlyPlaying = 0; // TODO: Calculate from active games
  const currentlyReffing = 0; // TODO: Calculate from active games

  const tabs = [
    { id: 'players' as TabType, label: 'Players', count: session.players.length },
    { id: 'schedule' as TabType, label: 'Schedule', count: session.bigTosses.length },
    { id: 'stats' as TabType, label: 'Stats', count: null },
  ];

  const renderPlayersTab = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 rounded-xl border border-orange-200 shadow-md">
          <div className="text-2xl sm:text-3xl font-bold text-orange-600">{session.players.length}</div>
          <div className="text-xs sm:text-sm font-semibold text-orange-800 uppercase tracking-wide">Total Players</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl border border-green-200 shadow-md">
          <div className="text-2xl sm:text-3xl font-bold text-green-600">{activePlayers.length}</div>
          <div className="text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wide">Active Players</div>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 sm:p-6 rounded-xl border border-pink-200 shadow-md">
          <div className="text-2xl sm:text-3xl font-bold text-pink-600">{currentlyPlaying}</div>
          <div className="text-xs sm:text-sm font-semibold text-pink-800 uppercase tracking-wide">Currently Playing</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-xl border border-purple-200 shadow-md">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">{currentlyReffing}</div>
          <div className="text-xs sm:text-sm font-semibold text-purple-800 uppercase tracking-wide">Currently Reffing</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b bg-gradient-to-r from-gray-50 to-orange-50">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Player Roster</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {session.players.length === 0 ? (
            <div className="px-4 py-8 sm:px-6 sm:py-12 text-center text-gray-500">
              <div className="text-orange-400 mb-3">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <p className="font-medium text-sm sm:text-base">No players added yet</p>
              <p className="text-xs sm:text-sm mt-1">Add players to start building your roster</p>
            </div>
          ) : (
            session.players.map((player) => (
              <div key={player.id} className="px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm flex-shrink-0 ${player.available ? 'bg-green-400' : 'bg-gray-300'}`} />
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">{player.name}</span>
                    {!player.active && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2">
                  {new Date(player.joinedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderScheduleTab = () => (
    <div className="space-y-6">
      {session.bigTosses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-pink-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-medium text-lg">No Big Tosses generated yet</p>
          <p className="text-sm mt-2">Add players and generate a Big Toss to see the schedule</p>
        </div>
      ) : (
        session.bigTosses.map((bigToss) => (
          <div key={bigToss.id} className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-pink-50 to-orange-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-lg">Big Toss #{bigToss.index + 1}</h3>
                <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                  {new Date(bigToss.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                {bigToss.games.map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        game.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        game.status === 'playing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {game.status}
                      </div>
                      <span className="font-semibold text-gray-900">Game #{game.index + 1}</span>
                      {game.isToFill && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                          To Fill
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {game.teams.teamA.length + game.teams.teamB.length} players
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      <div className="text-center py-12 text-gray-500">
        <div className="text-orange-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="font-medium text-lg">Statistics Dashboard</p>
        <p className="text-sm mt-2">Per-player fairness metrics and session statistics coming soon</p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'players':
        return renderPlayersTab();
      case 'schedule':
        return renderScheduleTab();
      case 'stats':
        return renderStatsTab();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-1.5 sm:p-2 shadow-md border border-gray-200">
        <nav className="flex space-x-1 sm:space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <span className="truncate">{tab.label}</span>
                {tab.count !== null && (
                  <span className={`py-0.5 px-1.5 sm:px-2 rounded-full text-xs font-bold flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-1 sm:py-2">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SessionDashboard;
