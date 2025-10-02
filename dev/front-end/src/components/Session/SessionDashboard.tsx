import React, { useState } from 'react';
import { useSession } from '../../store/SessionContext';
import PlayerList from '../Player/PlayerList';
import StatsView from '../Stats/StatsView';
import BigTossCard from '../Schedule/BigTossCard';

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
          <BigTossCard
            key={bigToss.id}
            bigToss={bigToss}
            arrayIndex={bigTossArrayIndex}
            players={session.players}
            onDelete={deleteBigToss}
          />
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
