import React, { useMemo } from 'react';
import { useSession } from '../../store/SessionContext';
import { selectPerPlayerSessionStats } from '../../core/statsSelectors';

const StatsView: React.FC = () => {
  const { state } = useSession();
  const session = state.session;

  if (!session) return null;

  const perPlayer = useMemo(() => selectPerPlayerSessionStats(session), [session]);

  return (
    <div className="space-y-6">
      {/* Per-Player Table */}
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
    </div>
  );
};

export default StatsView;
