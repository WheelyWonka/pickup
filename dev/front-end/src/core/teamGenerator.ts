/**
 * Team generation logic for Big Toss
 * Creates balanced 3v3 teams from available players
 */

import type { Player, Game, TeamSlot } from '../types/models';
import { shuffle, generateId } from '../utils';

export interface GenerateGamesOptions {
  players: Player[];
  bigTossId: string;
  startIndex?: number;
  shufflePlayers?: boolean;
}

interface GenerateResult {
  games: Game[];
  updatedPlayers: Player[];
}

function splitIntoTeams(sixSlots: TeamSlot[]): { teamA: TeamSlot[]; teamB: TeamSlot[] } {
  return {
    teamA: sixSlots.slice(0, 3),
    teamB: sixSlots.slice(3, 6),
  };
}

function chooseBonusOccupantsByFairness(
  candidates: Player[],
  count: number,
  currentBigTossGamesCount: Map<string, number>
): Player[] {
  const sorted = [...candidates].sort((a, b) => {
    const aBonus = a.sessionStats.bonusSlotsUsed;
    const bBonus = b.sessionStats.bonusSlotsUsed;
    if (aBonus !== bBonus) return aBonus - bBonus;

    const aBT = currentBigTossGamesCount.get(a.id) ?? 0;
    const bBT = currentBigTossGamesCount.get(b.id) ?? 0;
    if (aBT !== bBT) return aBT - bBT;

    const aLP = a.sessionStats.lastPlayedAt ?? 0;
    const bLP = b.sessionStats.lastPlayedAt ?? 0;
    if (aLP !== bLP) return aLP - bLP;

    if ((a.sessionStats.lastPlayedAt ?? null) === null && (b.sessionStats.lastPlayedAt ?? null) === null) {
      if (a.joinedAt !== b.joinedAt) return a.joinedAt - b.joinedAt;
    }

    return a.name.localeCompare(b.name);
  });

  return sorted.slice(0, count);
}

export const generateGames = (options: GenerateGamesOptions): GenerateResult => {
  const { players, bigTossId, startIndex = 0, shufflePlayers = true } = options;
  
  const eligiblePlayers = players.filter(p => p.active && p.available);
  
  if (eligiblePlayers.length < 6) {
    throw new Error('At least 6 players required to generate games');
  }

  const ordered = shufflePlayers ? shuffle(eligiblePlayers) : eligiblePlayers;

  const numGames = Math.ceil(ordered.length / 6);

  const games: Game[] = [];
  const currentBigTossGamesCount = new Map<string, number>();

  const markReserved = (playerId: string) => {
    currentBigTossGamesCount.set(playerId, (currentBigTossGamesCount.get(playerId) ?? 0) + 1);
  };

  let cursor = 0;
  const reservedAssignments: string[][] = [];
  for (let gi = 0; gi < numGames; gi++) {
    const remaining = ordered.length - cursor;
    const take = Math.min(6, remaining);
    const slice = ordered.slice(cursor, cursor + take).map(p => p.id);
    slice.forEach(pid => markReserved(pid));
    reservedAssignments.push(slice);
    cursor += take;
  }

  const lastIndex = numGames - 1;
  const lastReserved = reservedAssignments[lastIndex];
  const bonusNeeded = 6 - lastReserved.length;

  for (let gi = 0; gi < numGames; gi++) {
    const reservedIds = reservedAssignments[gi];
    const slots: TeamSlot[] = reservedIds.map(pid => ({ playerId: pid, slotType: 'reserved' }));

    if (gi === lastIndex && bonusNeeded > 0) {
      const candidateIds = new Set<string>(ordered.map(p => p.id));
      reservedIds.forEach(pid => candidateIds.delete(pid));
      const candidates = players.filter(p => candidateIds.has(p.id));

      const chosenBonus = chooseBonusOccupantsByFairness(candidates, bonusNeeded, currentBigTossGamesCount);
      chosenBonus.forEach(player => {
        slots.push({ playerId: player.id, slotType: 'bonus' });
      });
    }

    const sixSlots = slots.length === 6 ? slots : slots.concat([]);
    const teams = splitIntoTeams(sixSlots);

    games.push({
      id: generateId(),
      index: startIndex + gi,
      bigTossId,
      status: 'scheduled',
      teams,
      refs: { mainId: '', assistantId: '' },
    });
  }

  const bonusInThisBigToss = new Map<string, number>();
  games.forEach(g => {
    [...g.teams.teamA, ...g.teams.teamB].forEach(slot => {
      if (slot.slotType === 'bonus') {
        bonusInThisBigToss.set(slot.playerId, (bonusInThisBigToss.get(slot.playerId) ?? 0) + 1);
      }
    });
  });

  const updatedPlayers = players.map(p => {
    const addBonus = bonusInThisBigToss.get(p.id) ?? 0;
    if (addBonus === 0) return p;
    return {
      ...p,
      sessionStats: {
        ...p.sessionStats,
        bonusSlotsUsed: p.sessionStats.bonusSlotsUsed + addBonus,
      },
    };
  });

  return { games, updatedPlayers };
};


