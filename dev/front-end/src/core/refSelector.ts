/**
 * Referee selection logic
 * Prioritizes players with lowest ref counts who are not playing in the current game
 */

import type { Player, Game } from '../types/models';

interface RefCandidate {
  player: Player;
  assignedTotal: number;
}

function getAssignedRefCounts(allGames: Game[], allPlayers: Player[]): Map<string, number> {
  const counts = new Map<string, number>();
  allPlayers.forEach(p => counts.set(p.id, 0));
  allGames.forEach(g => {
    if (g.refs.mainId) counts.set(g.refs.mainId, (counts.get(g.refs.mainId) ?? 0) + 1);
    if (g.refs.assistantId) counts.set(g.refs.assistantId, (counts.get(g.refs.assistantId) ?? 0) + 1);
  });
  return counts;
}

function sortCandidates(candidates: RefCandidate[]): RefCandidate[] {
  return candidates.sort((a, b) => {
    // 1) lowest assignedTotal
    if (a.assignedTotal !== b.assignedTotal) return a.assignedTotal - b.assignedTotal;
    // 2) earliest lastRefedAt (null treated as 0)
    const aLast = a.player.sessionStats.lastRefedAt ?? 0;
    const bLast = b.player.sessionStats.lastRefedAt ?? 0;
    if (aLast !== bLast) return aLast - bLast;
    // 3) name
    return a.player.name.localeCompare(b.player.name);
  });
}

export function selectRefsForGame(
  game: Game,
  allPlayers: Player[],
  allGamesForAssignedCounts: Game[],
): { mainId: string | null; assistantId: string | null } {
  const playingPlayerIds = new Set([
    ...game.teams.teamA.map(s => s.playerId),
    ...game.teams.teamB.map(s => s.playerId),
  ]);

  const assignedCounts = getAssignedRefCounts(allGamesForAssignedCounts, allPlayers);

  const eligible = allPlayers.filter(p => !playingPlayerIds.has(p.id) && p.active && p.available);

  const candidates: RefCandidate[] = eligible.map(p => ({
    player: p,
    assignedTotal: assignedCounts.get(p.id) ?? 0,
  }));

  const sorted = sortCandidates(candidates);

  if (sorted.length === 0) {
    return { mainId: null, assistantId: null };
  }
  if (sorted.length === 1) {
    return { mainId: sorted[0].player.id, assistantId: null };
  }
  return { mainId: sorted[0].player.id, assistantId: sorted[1].player.id };
}

export function assignRefsToGames(
  games: Game[],
  allPlayers: Player[],
): Game[] {
  // Use all provided games to compute assigned counts; this function is designed to be called
  // after team updates so that assignments are consistent and valid
  const allGamesForCounts = games;
  return games.map(game => ({
    ...game,
    refs: selectRefsForGame(game, allPlayers, allGamesForCounts),
  }));
}


