import React, { useState } from 'react';
import { useSession } from '../../store/SessionContext';
import PlayerList from '../Player/PlayerList';
import StatsView from '../Stats/StatsView';

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
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 bg-gradient-to-r from-orange-500/10 to-pink-500/10 px-3 py-1 rounded-lg">{title}</div>
      <div className="space-y-2">
        {slots.map((slot, idx) => (
          <div key={`${slot.playerId}-${idx}`} className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-orange-200/30 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="font-semibold text-gray-800 truncate">{getPlayerName(slot.playerId)}</div>
            <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-bold shadow-sm ${
              slot.slotType === 'reserved' 
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/50' 
                : 'bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 border border-orange-200/50'
            }`}>
              {slot.slotType}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRefs = (mainId: string | null, assistantId: string | null) => {
    const mainName = mainId ? getPlayerName(mainId) : 'Needs ref';
    const asstName = assistantId ? getPlayerName(assistantId) : 'Needs ref';
    return (
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/60 border border-orange-200/30 rounded-lg">
          <span className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"></span>
          <span className="font-medium text-gray-700">Main:</span> 
          <span className={`font-semibold ${mainId ? 'text-orange-600' : 'text-red-500'}`}>{mainName}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/60 border border-pink-200/30 rounded-lg">
          <span className="w-2 h-2 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"></span>
          <span className="font-medium text-gray-700">Asst:</span> 
          <span className={`font-semibold ${assistantId ? 'text-pink-600' : 'text-red-500'}`}>{asstName}</span>
        </span>
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
          <div key={bigToss.id} className="bg-white/90 backdrop-blur-sm border border-orange-200/30 rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-b border-orange-200/20">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-900 text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Big Toss #{bigTossArrayIndex + 1}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-orange-200/30 shadow-sm">
                    {new Date(bigToss.createdAt).toLocaleString()}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Delete this Big Toss? This cannot be undone.')) {
                        deleteBigToss(bigToss.id);
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50/80 rounded-lg transition-all duration-200"
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
            <div className="p-1">
              <div className="grid gap-4">
                {bigToss.games.map((game) => (
                  <div key={game.id} className="p-4 bg-gradient-to-r from-white/80 to-orange-50/80 backdrop-blur-sm rounded-xl border border-orange-200/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 text-lg">Game #{game.index + 1}</span>
                        <div className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm border ${
                          game.status === 'scheduled' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200/50' :
                          game.status === 'playing' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200/50' :
                          'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200/50'
                        }`}>
                          {game.status}
                        </div>
                        {game.isToFill && (
                          <span className="text-xs bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800 px-3 py-1 rounded-full font-semibold border border-orange-200/50 shadow-sm">
                            To Fill
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 font-semibold bg-white/60 px-3 py-1 rounded-lg border border-orange-200/30">
                        {game.teams.teamA.length + game.teams.teamB.length} players
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      {renderTeamColumn('Team A', game.teams.teamA)}
                      {renderTeamColumn('Team B', game.teams.teamB)}
                    </div>

                    <div className="mt-4 border-t border-orange-200/30 pt-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 bg-gradient-to-r from-orange-500/10 to-pink-500/10 px-3 py-1 rounded-lg inline-block">
                        Referees
                      </div>
                      <div className="flex items-center justify-between">
                        {renderRefs(game.refs.mainId, game.refs.assistantId)}
                      </div>
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
      <StatsView />
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
