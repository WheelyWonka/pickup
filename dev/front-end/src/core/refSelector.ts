/**
 * Referee selection logic
 * Prioritizes players with lowest ref counts who are not playing in the current game
 */

import type { Player, Game } from '../types/models';

interface RefCandidate {
  player: Player;
  totalRefs: number;
}

export const selectRefs = (game: Game, allPlayers: Player[]): { mainId: string; assistantId: string } => {
  const playingPlayerIds = new Set([
    ...game.teams.teamA.map(s => s.playerId),
    ...game.teams.teamB.map(s => s.playerId),
  ]);
  
  const eligiblePlayers = allPlayers.filter(
    p => !playingPlayerIds.has(p.id) && p.active && p.available
  );
  
  if (eligiblePlayers.length < 2) {
    console.warn('Not enough eligible players for refs, using empty refs');
    return { mainId: '', assistantId: '' };
  }
  
  const candidates: RefCandidate[] = eligiblePlayers.map(player => ({
    player,
    totalRefs: player.sessionStats.refsMain + player.sessionStats.refsAssistant,
  }));
  
  candidates.sort((a, b) => {
    if (a.totalRefs !== b.totalRefs) {
      return a.totalRefs - b.totalRefs;
    }
    const aLastRefed = a.player.sessionStats.lastRefedAt ?? 0;
    const bLastRefed = b.player.sessionStats.lastRefedAt ?? 0;
    if (aLastRefed !== bLastRefed) {
      return aLastRefed - bLastRefed;
    }
    return a.player.name.localeCompare(b.player.name);
  });
  
  return {
    mainId: candidates[0].player.id,
    assistantId: candidates[1].player.id,
  };
};

export const assignRefsToGames = (games: Game[], allPlayers: Player[]): Game[] => {
  return games.map(game => ({
    ...game,
    refs: selectRefs(game, allPlayers),
  }));
};


