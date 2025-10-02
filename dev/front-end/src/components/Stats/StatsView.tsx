import React, { useMemo, useState } from 'react';
import { useSession } from '../../store/SessionContext';
import { selectPerPlayerSessionStats, selectBigTossSummary, selectRefDistribution } from '../../core/statsSelectors';

const StatsView: React.FC = () => {
  const { state } = useSession();
  const session = state.session;
  const [activeTab, setActiveTab] = useState<'perPlayer' | 'bigToss' | 'refs'>('perPlayer');

  if (!session) return null;

  const perPlayer = useMemo(() => selectPerPlayerSessionStats(session), [session]);
  const btSummary = useMemo(() => selectBigTossSummary(session), [session]);
  const refSummary = useMemo(() => selectRefDistribution(session), [session]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg p-1 shadow-md border border-gray-200">
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab('perPlayer')}
            className={`flex-1 py-1.5 px-2 rounded-md font-semibold text-xs transition-all duration-200 ${
              activeTab === 'perPlayer'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Players
          </button>
          <button
            onClick={() => setActiveTab('bigToss')}
            className={`flex-1 py-1.5 px-2 rounded-md font-semibold text-xs transition-all duration-200 ${
              activeTab === 'bigToss'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Big Tosses
          </button>
          <button
            onClick={() => setActiveTab('refs')}
            className={`flex-1 py-1.5 px-2 rounded-md font-semibold text-xs transition-all duration-200 ${
              activeTab === 'refs'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Refs
          </button>
        </nav>
      </div>

      {/* Per-Player Table */}
      {activeTab === 'perPlayer' && (
        <div className="bg-white/90 backdrop-blur-sm border border-orange-200/30 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 py-4 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-b border-orange-200/20">
            <h3 className="font-bold text-gray-900 text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Player Session Stats</h3>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm text-gray-600 border-b border-orange-200/20">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Player</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">Games</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">Reserved</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">Bonus</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">Refs Main</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">Refs Asst</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">Total Refs</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">Bench Wait</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">Streak</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">Fairness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100/50">
                {perPlayer.map((row, index) => (
                  <tr key={row.playerId} className={`hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-pink-50/50 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-white/50' : 'bg-orange-50/20'
                  }`}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{row.name}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-gray-800">{row.gamesPlayed}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-gray-800">{row.reservedCount}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-gray-800">{row.bonusCount}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-gray-800">{row.refsMainAssigned}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-gray-800">{row.refsAssistantAssigned}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-gray-800">{row.totalRefsAssigned}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-gray-800">{row.benchWait}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-gray-800">{row.consecutiveGamesPlayed}</td>
                    <td className="px-3 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm ${
                        row.fairnessIndicator==='underplayed' ? 'bg-blue-100/80 text-blue-700 border border-blue-200/50' :
                        row.fairnessIndicator==='over-bonus' ? 'bg-orange-100/80 text-orange-700 border border-orange-200/50' :
                        row.fairnessIndicator==='over-ref' ? 'bg-purple-100/80 text-purple-700 border border-purple-200/50' : 
                        'bg-green-100/80 text-green-700 border border-green-200/50'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          row.fairnessIndicator==='underplayed' ? 'bg-blue-500' :
                          row.fairnessIndicator==='over-bonus' ? 'bg-orange-500' :
                          row.fairnessIndicator==='over-ref' ? 'bg-purple-500' : 'bg-green-500'
                        }`}></span>
                        {row.fairnessIndicator === 'over-bonus' ? 'bonus' : 
                         row.fairnessIndicator === 'over-ref' ? 'ref' : 
                         row.fairnessIndicator}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Big Toss Summary */}
      {activeTab === 'bigToss' && (
        <div className="bg-white/90 backdrop-blur-sm border border-orange-200/30 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 py-4 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-b border-orange-200/20">
            <h3 className="font-bold text-gray-900 text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Big Toss Summary</h3>
          </div>
          <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="px-4 py-3 bg-gradient-to-r from-orange-50/80 to-pink-50/80 border border-orange-200/30 rounded-xl shadow-sm">
              <span className="text-gray-700 font-medium">Games: </span>
              <span className="font-bold text-orange-600">{btSummary.numGames}</span>
            </div>
            <div className="px-4 py-3 bg-gradient-to-r from-orange-50/80 to-pink-50/80 border border-orange-200/30 rounded-xl shadow-sm">
              <span className="text-gray-700 font-medium">Total Bonus Slots: </span>
              <span className="font-bold text-pink-600">{btSummary.totalBonusSlots}</span>
            </div>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm text-gray-600 border-b border-orange-200/20">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Player</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">Reserved</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">Bonus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100/50">
                {btSummary.reservedVsBonusPerPlayer.map((r, index) => (
                  <tr key={r.playerId} className={`hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-pink-50/50 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-white/50' : 'bg-orange-50/20'
                  }`}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{r.name}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-orange-600">{r.reserved}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-pink-600">{r.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ref Distribution */}
      {activeTab === 'refs' && (
        <div className="bg-white/90 backdrop-blur-sm border border-orange-200/30 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 py-4 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-b border-orange-200/20">
            <h3 className="font-bold text-gray-900 text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Ref Distribution</h3>
          </div>
          <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="px-4 py-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/30 rounded-xl shadow-sm">
              <span className="text-gray-700 font-medium">Fully staffed: </span>
              <span className="font-bold text-green-600">{refSummary.fullyStaffed}</span>
            </div>
            <div className="px-4 py-3 bg-gradient-to-r from-orange-50/80 to-amber-50/80 border border-orange-200/30 rounded-xl shadow-sm">
              <span className="text-gray-700 font-medium">Missing main: </span>
              <span className="font-bold text-orange-600">{refSummary.missingMain}</span>
            </div>
            <div className="px-4 py-3 bg-gradient-to-r from-pink-50/80 to-rose-50/80 border border-pink-200/30 rounded-xl shadow-sm">
              <span className="text-gray-700 font-medium">Missing assistant: </span>
              <span className="font-bold text-pink-600">{refSummary.missingAssistant}</span>
            </div>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm text-gray-600 border-b border-orange-200/20">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Player</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">Assigned Refs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100/50">
                {refSummary.refLoadByPlayer.map((r, index) => (
                  <tr key={r.playerId} className={`hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-pink-50/50 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-white/50' : 'bg-orange-50/20'
                  }`}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{r.name}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-orange-600">{r.assigned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsView;
