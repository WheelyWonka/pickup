import { useMemo } from 'react';
import type { Player } from '../types/models';

export function usePlayersMap(players: Player[]) {
  return useMemo(() => new Map(players.map(p => [p.id, p] as const)), [players]);
}
