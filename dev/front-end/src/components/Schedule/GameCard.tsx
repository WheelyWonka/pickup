import React from 'react';
import type { Game, TeamSlot, Player } from '../../types/models';

interface Props {
  game: Game;
  players: Player[];
}

function getPlayerName(players: Player[], playerId: string): string {
  const p = players.find(pp => pp.id === playerId);
  return p ? p.name : 'Unknown';
}

const TeamColumn: React.FC<{ title: string; slots: TeamSlot[]; players: Player[] }> = ({ title, slots, players }) => (
  <div className="flex-1">
    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</div>
    <div className="space-y-2">
      {slots.map((slot, idx) => (
        <div key={`${slot.playerId}-${idx}`} className="flex items-center justify-between bg-white/60 border border-gray-200 rounded-lg px-3 py-2">
          <div className="font-medium text-gray-800 truncate">{getPlayerName(players, slot.playerId)}</div>
          <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-bold ${slot.slotType === 'reserved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {slot.slotType}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const RefsRow: React.FC<{ mainId: string | null; assistantId: string | null; players: Player[] }> = ({ mainId, assistantId, players }) => {
  const mainName = mainId ? getPlayerName(players, mainId) : 'Needs ref';
  const asstName = assistantId ? getPlayerName(players, assistantId) : 'Needs ref';
  return (
    <div className="flex items-center gap-3 text-xs text-gray-600">
      <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>Main: <span className={`font-medium ${mainId ? '' : 'text-red-600'}`}>{mainName}</span></span>
      <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-indigo-400 rounded-full"></span>Asst: <span className={`font-medium ${assistantId ? '' : 'text-red-600'}`}>{asstName}</span></span>
    </div>
  );
};

const GameCard: React.FC<Props> = ({ game, players }) => {
  return (
    <div className="p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
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
        <TeamColumn title="Team A" slots={game.teams.teamA} players={players} />
        <TeamColumn title="Team B" slots={game.teams.teamB} players={players} />
      </div>

      <div className="mt-4 border-t pt-3 flex items-center justify-between">
        <RefsRow mainId={game.refs.mainId} assistantId={game.refs.assistantId} players={players} />
      </div>
    </div>
  );
};

export default GameCard;
