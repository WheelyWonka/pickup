import React from 'react';
import type { BigToss, Player } from '../../types/models';
import GameCard from './GameCard';

interface Props {
  bigToss: BigToss;
  arrayIndex: number;
  players: Player[];
  onDelete: (id: string) => void;
}

const BigTossCard: React.FC<Props> = ({ bigToss, arrayIndex, players, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-pink-50 to-orange-50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900 text-lg">Big Toss #{arrayIndex + 1}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">{bigToss.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
              {new Date(bigToss.createdAt).toLocaleString()}
            </div>
            <button
              onClick={() => { if (confirm('Delete this Big Toss? This cannot be undone.')) { onDelete(bigToss.id); } }}
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
          {bigToss.games.map(game => (
            <GameCard key={game.id} game={game} players={players} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BigTossCard;
