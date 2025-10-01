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
    <div className="space-y-5">
      {/* Tabs */}
      <div className="bg-white rounded-xl p-1.5 shadow-sm border border-gray-200 inline-flex">
        <button
          onClick={() => setActiveTab('perPlayer')}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
            activeTab==='perPlayer' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >Per-Player</button>
        <button
          onClick={() => setActiveTab('bigToss')}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
            activeTab==='bigToss' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >Big Toss Summary</button>
        <button
          onClick={() => setActiveTab('refs')}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
            activeTab==='refs' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >Ref Distribution</button>
      </div>

      {/* Per-Player Table */}
      {activeTab === 'perPlayer' && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gradient-to-r from-orange-50 to-pink-50">
            <h3 className="font-semibold text-gray-900">Per-Player Session Stats</h3>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur text-gray-600">
                <tr className="border-b">
                  <th className="px-3 py-2 text-left font-semibold">Player</th>
                  <th className="px-3 py-2 text-right font-semibold">Games</th>
                  <th className="px-3 py-2 text-right font-semibold">Reserved</th>
                  <th className="px-3 py-2 text-right font-semibold">Bonus</th>
                  <th className="px-3 py-2 text-right font-semibold">Refs Main</th>
                  <th className="px-3 py-2 text-right font-semibold">Refs Asst</th>
                  <th className="px-3 py-2 text-right font-semibold">Total Refs</th>
                  <th className="px-3 py-2 text-right font-semibold">Bench Wait</th>
                  <th className="px-3 py-2 text-right font-semibold">Streak</th>
                  <th className="px-3 py-2 text-left font-semibold">Fairness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {perPlayer.map(row => (
                  <tr key={row.playerId} className="odd:bg-white even:bg-gray-50 hover:bg-orange-50/40 transition-colors">
                    <td className="px-3 py-2 font-medium text-gray-900">{row.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.gamesPlayed}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.reservedCount}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.bonusCount}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.refsMainAssigned}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.refsAssistantAssigned}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.totalRefsAssigned}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.benchWait}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.consecutiveGamesPlayed}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                        row.fairnessIndicator==='underplayed' ? 'bg-blue-100 text-blue-700' :
                        row.fairnessIndicator==='over-bonus' ? 'bg-orange-100 text-orange-700' :
                        row.fairnessIndicator==='over-ref' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          row.fairnessIndicator==='underplayed' ? 'bg-blue-500' :
                          row.fairnessIndicator==='over-bonus' ? 'bg-orange-500' :
                          row.fairnessIndicator==='over-ref' ? 'bg-purple-500' : 'bg-green-500'
                        }`}></span>
                        {row.fairnessIndicator}
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
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gradient-to-r from-orange-50 to-pink-50">
            <h3 className="font-semibold text-gray-900">Big Toss Summary</h3>
          </div>
          <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="px-3 py-2 bg-gray-50 border rounded-lg">Games: <span className="font-semibold">{btSummary.numGames}</span></div>
            <div className="px-3 py-2 bg-gray-50 border rounded-lg">Total Bonus Slots: <span className="font-semibold">{btSummary.totalBonusSlots}</span></div>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur text-gray-600">
                <tr className="border-b">
                  <th className="px-3 py-2 text-left font-semibold">Player</th>
                  <th className="px-3 py-2 text-right font-semibold">Reserved</th>
                  <th className="px-3 py-2 text-right font-semibold">Bonus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {btSummary.reservedVsBonusPerPlayer.map(r => (
                  <tr key={r.playerId} className="odd:bg-white even:bg-gray-50 hover:bg-orange-50/40 transition-colors">
                    <td className="px-3 py-2 font-medium text-gray-900">{r.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.reserved}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ref Distribution */}
      {activeTab === 'refs' && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gradient-to-r from-orange-50 to-pink-50">
            <h3 className="font-semibold text-gray-900">Ref Distribution</h3>
          </div>
          <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="px-3 py-2 bg-gray-50 border rounded-lg">Fully staffed: <span className="font-semibold">{refSummary.fullyStaffed}</span></div>
            <div className="px-3 py-2 bg-gray-50 border rounded-lg">Missing main: <span className="font-semibold">{refSummary.missingMain}</span></div>
            <div className="px-3 py-2 bg-gray-50 border rounded-lg">Missing assistant: <span className="font-semibold">{refSummary.missingAssistant}</span></div>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur text-gray-600">
                <tr className="border-b">
                  <th className="px-3 py-2 text-left font-semibold">Player</th>
                  <th className="px-3 py-2 text-right font-semibold">Assigned Refs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {refSummary.refLoadByPlayer.map(r => (
                  <tr key={r.playerId} className="odd:bg-white even:bg-gray-50 hover:bg-orange-50/40 transition-colors">
                    <td className="px-3 py-2 font-medium text-gray-900">{r.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.assigned}</td>
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
