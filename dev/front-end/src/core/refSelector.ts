/**
 * Referee selection logic
 * Prioritizes players with lowest ref counts who are not playing in the current game
 */

import type { Player, Game } from '../types/models';

interface RefCandidate {
  player: Player;
  totalRefs: number;
}

/**
 * Select refs for a game
 * Priority: ascending by (sessionRefsTotal, lastRefedAt, name)
 */
export const selectRefs = (game: Game, allPlayers: Player[]): { mainId: string; assistantId: string } => {
  const playingPlayerIds = new Set([
    ...game.teams.teamA,
    ...game.teams.teamB,
  ]);
  
  // Get eligible players (not playing in this game, active, available)
  const eligiblePlayers = allPlayers.filter(
    p => !playingPlayerIds.has(p.id) && p.active && p.available
  );
  
  if (eligiblePlayers.length < 2) {
    console.warn('Not enough eligible players for refs, using empty refs');
    return { mainId: '', assistantId: '' };
  }
  
  // Create candidates with total ref count
  const candidates: RefCandidate[] = eligiblePlayers.map(player => ({
    player,
    totalRefs: player.sessionStats.refsMain + player.sessionStats.refsAssistant,
  }));
  
  // Sort by priority
  candidates.sort((a, b) => {
    // First: total refs (ascending)
    if (a.totalRefs !== b.totalRefs) {
      return a.totalRefs - b.totalRefs;
    }
    
    // Second: last refed time (ascending, null = never = highest priority)
    const aLastRefed = a.player.sessionStats.lastRefedAt ?? 0;
    const bLastRefed = b.player.sessionStats.lastRefedAt ?? 0;
    if (aLastRefed !== bLastRefed) {
      return aLastRefed - bLastRefed;
    }
    
    // Third: name (alphabetical)
    return a.player.name.localeCompare(b.player.name);
  });
  
  return {
    mainId: candidates[0].player.id,
    assistantId: candidates[1].player.id,
  };
};

/**
 * Assign refs to all games in a list
 */
export const assignRefsToGames = (games: Game[], allPlayers: Player[]): Game[] => {
  return games.map(game => ({
    ...game,
    refs: selectRefs(game, allPlayers),
  }));
};


