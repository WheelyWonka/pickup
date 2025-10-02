import type { Game, Player, TeamSlot } from '../types/models';

export function isPlayerEligible(player: Player): boolean {
  return player.active && player.available;
}

export function countBigTossGamesPerPlayer(games: Game[]): Map<string, number> {
  const counts = new Map<string, number>();
  games.forEach(game => {
    const allSlots: TeamSlot[] = [...game.teams.teamA, ...game.teams.teamB];
    allSlots.forEach(slot => {
      counts.set(slot.playerId, (counts.get(slot.playerId) ?? 0) + 1);
    });
  });
  return counts;
}

export function sortPlayersForBonus(
  candidates: Player[],
  currentBigTossGamesCount: Map<string, number>
): Player[] {
  return [...candidates].sort((a, b) => {
    // 1) fewest session bonus slots used
    const aBonus = a.sessionStats.bonusSlotsUsed;
    const bBonus = b.sessionStats.bonusSlotsUsed;
    if (aBonus !== bBonus) return aBonus - bBonus;

    // 2) fewest games in current Big Toss
    const aBT = currentBigTossGamesCount.get(a.id) ?? 0;
    const bBT = currentBigTossGamesCount.get(b.id) ?? 0;
    if (aBT !== bBT) return aBT - bBT;

    // 3) earliest lastPlayedAt (null treated as 0)
    const aLP = a.sessionStats.lastPlayedAt ?? 0;
    const bLP = b.sessionStats.lastPlayedAt ?? 0;
    if (aLP !== bLP) return aLP - bLP;

    // 4) if both have no lastPlayedAt, use joinedAt
    if ((a.sessionStats.lastPlayedAt ?? null) === null && (b.sessionStats.lastPlayedAt ?? null) === null) {
      if (a.joinedAt !== b.joinedAt) return a.joinedAt - b.joinedAt;
    }

    // 5) alphabetical
    return a.name.localeCompare(b.name);
  });
}

export function choosePlayersForBonus(
  candidates: Player[],
  count: number,
  currentBigTossGamesCount: Map<string, number>
): Player[] {
  return sortPlayersForBonus(candidates, currentBigTossGamesCount).slice(0, count);
}
