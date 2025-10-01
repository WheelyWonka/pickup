import React, { useState } from 'react';
import { useSession } from '../../store/SessionContext';
import { useCallback } from 'react';
import type { Player } from '../../types/models';
import PlayerList from '../Player/PlayerList';

type TabType = 'players' | 'schedule' | 'stats';

const SessionDashboard: React.FC = () => {
  const { state, deleteBigToss } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('players');
  const session = state.session;

  if (!session) {
    return null;
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
      {/* Player Stats Cards */}
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

      {/* Player Management */}
      <PlayerList />
    </div>
  );

  const getPlayerName = (playerId: string): string => {
    const p = session.players.find(pp => pp.id === playerId);
    return p ? p.name : 'Unknown';
  };

  const renderTeamColumn = (title: string, slots: { playerId: string; slotType: 'reserved' | 'bonus' }[]) => (
    <div className="flex-1">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</div>
      <div className="space-y-2">
        {slots.map((slot, idx) => (
          <div key={`${slot.playerId}-${idx}`} className="flex items-center justify-between bg-white/60 border border-gray-200 rounded-lg px-3 py-2">
            <div className="font-medium text-gray-800 truncate">{getPlayerName(slot.playerId)}</div>
            <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-bold ${slot.slotType === 'reserved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {slot.slotType}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRefs = (mainId: string, assistantId: string) => {
    const mainName = mainId ? getPlayerName(mainId) : 'TBD';
    const asstName = assistantId ? getPlayerName(assistantId) : 'TBD';
    return (
      <div className="flex items-center gap-3 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>Main: <span className="font-medium">{mainName}</span></span>
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-indigo-400 rounded-full"></span>Asst: <span className="font-medium">{asstName}</span></span>
      </div>
    );
  };

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
        session.bigTosses.map((bigToss, bigTossArrayIndex) => (
          <div key={bigToss.id} className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-pink-50 to-orange-50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900 text-lg">Big Toss #{bigTossArrayIndex + 1}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">{bigToss.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                    {new Date(bigToss.createdAt).toLocaleString()}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Delete this Big Toss? This cannot be undone.')) {
                        deleteBigToss(bigToss.id);
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    aria-label="Delete Big Toss"
                    title="Delete Big Toss"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                {bigToss.games.map((game) => (
                  <div key={game.id} className="p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
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

                    <div className="flex flex-col sm:flex-row gap-4">
                      {renderTeamColumn('Team A', game.teams.teamA)}
                      {renderTeamColumn('Team B', game.teams.teamB)}
                    </div>

                    <div className="mt-4 border-t pt-3 flex items-center justify-between">
                      {renderRefs(game.refs.mainId, game.refs.assistantId)}
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
