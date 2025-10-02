import type { BigToss, Game, Player, TeamSlot } from '../types/models';
import { generateId } from '../utils';
import { isPlayerEligible, countBigTossGamesPerPlayer, choosePlayersForBonus } from './fairness';

interface AdjustmentResult {
  bigToss: BigToss;
  players: Player[];
}

function chooseDisplacementCandidate(
  bonusSlots: TeamSlot[],
  playersById: Map<string, Player>,
  currentBigTossGamesCount: Map<string, number>
): string | undefined {
  const sorted = [...bonusSlots].sort((a, b) => {
    const pa = playersById.get(a.playerId)!;
    const pb = playersById.get(b.playerId)!;

    // Highest session bonus first (descending)
    const aBonus = pa.sessionStats.bonusSlotsUsed;
    const bBonus = pb.sessionStats.bonusSlotsUsed;
    if (aBonus !== bBonus) return bBonus - aBonus;

    // Then fewest games in current Big Toss (ascending)
    const aBT = currentBigTossGamesCount.get(pa.id) ?? 0;
    const bBT = currentBigTossGamesCount.get(pb.id) ?? 0;
    if (aBT !== bBT) return aBT - bBT;

    // Then earliest lastPlayedAt (ascending)
    const aLP = pa.sessionStats.lastPlayedAt ?? 0;
    const bLP = pb.sessionStats.lastPlayedAt ?? 0;
    if (aLP !== bLP) return aLP - bLP;

    // Then alphabetical
    return pa.name.localeCompare(pb.name);
  });
  return sorted[0]?.playerId;
}

function gameHasOnlyBonus(game: Game): boolean {
  const all: TeamSlot[] = [...game.teams.teamA, ...game.teams.teamB];
  return all.length > 0 && all.every(s => s.slotType === 'bonus');
}

function makeEmptyGame(bigTossId: string, index: number): Game {
  return {
    id: generateId(),
    index,
    bigTossId,
    status: 'scheduled',
    teams: { teamA: [], teamB: [] },
    refs: { mainId: null, assistantId: null },
  };
}

export function addPlayerToBigToss(bigToss: BigToss, players: Player[], newPlayerId: string): AdjustmentResult {
  const playersById = new Map(players.map(p => [p.id, p] as const));
  const eligible = players.filter(isPlayerEligible);
  const neededGames = Math.ceil(eligible.length / 6);

  const currentGames = bigToss.games.map(g => ({ ...g, teams: { teamA: [...g.teams.teamA], teamB: [...g.teams.teamB] } }));
  const updatedPlayers = [...players];
  const btCount = countBigTossGamesPerPlayer(currentGames);

  const updatePlayer = (pid: string, fn: (p: Player) => Player) => {
    const idx = updatedPlayers.findIndex(p => p.id === pid);
    if (idx >= 0) updatedPlayers[idx] = fn(updatedPlayers[idx]);
  };

  let games = currentGames;

  if (games.length < neededGames) {
    // Create a new game: new player gets Reserved, others fill as Bonus by fairness
    const newIndex = games.length;
    const g = makeEmptyGame(bigToss.id, newIndex);
    g.teams.teamA.push({ playerId: newPlayerId, slotType: 'reserved' });

    const candidatePlayers = eligible.filter(p => p.id !== newPlayerId);
    const chosen = choosePlayersForBonus(candidatePlayers, 5, btCount);
    const chosenSlots: TeamSlot[] = chosen.map(p => ({ playerId: p.id, slotType: 'bonus' }));

    chosenSlots.forEach(slot => {
      if (g.teams.teamA.length < 3) g.teams.teamA.push(slot);
      else g.teams.teamB.push(slot);
    });

    chosen.forEach(p => updatePlayer(p.id, up => ({
      ...up,
      sessionStats: { ...up.sessionStats, bonusSlotsUsed: up.sessionStats.bonusSlotsUsed + 1 },
    })));

    games = [...games, g];
  } else {
    // Convert an existing Bonus slot to Reserved for the new player
    const targetIndex = games.findIndex(game => game.teams.teamA.some(s => s.slotType === 'bonus') || game.teams.teamB.some(s => s.slotType === 'bonus'));
    if (targetIndex === -1) {
      // No bonus slots: append new game recursively
      const btClone: BigToss = { ...bigToss, games };
      return addPlayerToBigToss(btClone, updatedPlayers, newPlayerId);
    }

    const game = games[targetIndex];
    const bonusSlots: TeamSlot[] = [...game.teams.teamA.filter(s => s.slotType === 'bonus'), ...game.teams.teamB.filter(s => s.slotType === 'bonus')];
    const displaceId = chooseDisplacementCandidate(bonusSlots, playersById, btCount);

    const replaceIn = (arr: TeamSlot[]) => {
      const idx = arr.findIndex(s => s.playerId === displaceId && s.slotType === 'bonus');
      if (idx >= 0) arr[idx] = { playerId: newPlayerId, slotType: 'reserved' };
    };
    replaceIn(game.teams.teamA);
    replaceIn(game.teams.teamB);

    if (displaceId) {
      updatePlayer(displaceId, up => ({
        ...up,
        sessionStats: { ...up.sessionStats, bonusSlotsUsed: Math.max(0, up.sessionStats.bonusSlotsUsed - 1) },
      }));
    }
  }

  const updatedBigToss: BigToss = { ...bigToss, games };
  return { bigToss: updatedBigToss, players: updatedPlayers };
}

export function removePlayerFromBigToss(bigToss: BigToss, players: Player[], removedPlayerId: string): AdjustmentResult {
  const updatedPlayers = players.filter(p => p.id !== removedPlayerId);
  let games = bigToss.games.map(g => ({ ...g, teams: { teamA: [...g.teams.teamA], teamB: [...g.teams.teamB] } }));

  // Determine where the removed player was and what slot type
  let vacatedGameIndex: number | null = null;
  let vacatedWasReserved = false;
  for (let gi = 0; gi < bigToss.games.length; gi++) {
    const g = bigToss.games[gi];
    const inA = g.teams.teamA.find(s => s.playerId === removedPlayerId);
    const inB = g.teams.teamB.find(s => s.playerId === removedPlayerId);
    if (inA || inB) {
      vacatedGameIndex = gi;
      vacatedWasReserved = !!((inA && inA.slotType === 'reserved') || (inB && inB.slotType === 'reserved'));
      break;
    }
  }

  // Remove the player from all games
  games.forEach(g => {
    g.teams.teamA = g.teams.teamA.filter(s => s.playerId !== removedPlayerId);
    g.teams.teamB = g.teams.teamB.filter(s => s.playerId !== removedPlayerId);
  });

  // Drop empty games
  games = games.filter(g => g.teams.teamA.length + g.teams.teamB.length > 0);

  const btCount = countBigTossGamesPerPlayer(games);

  const bumpBonus = (pid: string) => {
    const idx = updatedPlayers.findIndex(p => p.id === pid);
    if (idx >= 0) {
      const up = updatedPlayers[idx];
      updatedPlayers[idx] = {
        ...up,
        sessionStats: { ...up.sessionStats, bonusSlotsUsed: up.sessionStats.bonusSlotsUsed + 1 },
      };
    }
  };

  if (vacatedGameIndex !== null && vacatedWasReserved) {
    // Try consolidation: find later game with exactly one Reserved slot
    let moveFromIndex: number | null = null;
    for (let gi = vacatedGameIndex + 1; gi < games.length; gi++) {
      const g = games[gi];
      const reservedCount = [...g.teams.teamA, ...g.teams.teamB].filter(s => s.slotType === 'reserved').length;
      if (reservedCount === 1) {
        moveFromIndex = gi;
        break;
      }
    }

    if (moveFromIndex !== null) {
      const source = games[moveFromIndex];
      // Find first reserved slot in source
      let movedSlot: TeamSlot | undefined = source.teams.teamA.find(s => s.slotType === 'reserved');
      if (movedSlot) {
        source.teams.teamA = source.teams.teamA.filter(s => s !== movedSlot);
      } else {
        movedSlot = source.teams.teamB.find(s => s.slotType === 'reserved');
        if (movedSlot) {
          source.teams.teamB = source.teams.teamB.filter(s => s !== movedSlot);
        }
      }

      if (movedSlot) {
        const target = games[vacatedGameIndex];
        const assign: TeamSlot = { playerId: movedSlot.playerId, slotType: 'reserved' };
        if (target.teams.teamA.length < 3) target.teams.teamA.push(assign);
        else target.teams.teamB.push(assign);

        // If source becomes bonus-only, delete it
        if (gameHasOnlyBonus(source)) {
          games.splice(moveFromIndex, 1);
          games = games.map((g, idx) => ({ ...g, index: idx }));
        }
      }
    } else {
      // Option B: directly choose a fair replacement Reserved from eligible players not in the same game
      const target = games[vacatedGameIndex];
      const slotsInTarget: TeamSlot[] = [...target.teams.teamA, ...target.teams.teamB];
      const inTargetIds = new Set<string>(slotsInTarget.map((s: TeamSlot) => s.playerId));
      const candidates = updatedPlayers.filter(p => isPlayerEligible(p) && !inTargetIds.has(p.id));

      // Build set of players who already have a Reserved slot in this Big Toss
      const reservedIds = new Set<string>();
      games.forEach(g => {
        [...g.teams.teamA, ...g.teams.teamB].forEach(s => {
          if (s.slotType === 'reserved') reservedIds.add(s.playerId);
        });
      });

      const candidatesWithoutReserved = candidates.filter(p => !reservedIds.has(p.id));
      let chosen: Player | undefined;
      if (candidatesWithoutReserved.length > 0) {
        chosen = choosePlayersForBonus(candidatesWithoutReserved, 1, btCount)[0];
      } else {
        chosen = choosePlayersForBonus(candidates, 1, btCount)[0];
      }

      if (chosen) {
        if (!reservedIds.has(chosen.id)) {
          // Can assign as Reserved
          if (target.teams.teamA.length < 3) target.teams.teamA.push({ playerId: chosen.id, slotType: 'reserved' });
          else target.teams.teamB.push({ playerId: chosen.id, slotType: 'reserved' });
        } else {
          // Already has a Reserved elsewhere; assign as Bonus instead
          const bonusSlot: TeamSlot = { playerId: chosen.id, slotType: 'bonus' };
          if (target.teams.teamA.length < 3) target.teams.teamA.push(bonusSlot);
          else target.teams.teamB.push(bonusSlot);
          // Increment session bonus count
          const idx = updatedPlayers.findIndex(p => p.id === chosen!.id);
          if (idx >= 0) {
            const up = updatedPlayers[idx];
            updatedPlayers[idx] = {
              ...up,
              sessionStats: { ...up.sessionStats, bonusSlotsUsed: up.sessionStats.bonusSlotsUsed + 1 },
            };
          }
        }
      }
    }
  } else if (vacatedGameIndex !== null) {
    // Vacated was bonus: refill bonus by fairness among eligible not in game
    const target = games[vacatedGameIndex];
    const slotsInTarget: TeamSlot[] = [...target.teams.teamA, ...target.teams.teamB];
    const inTargetIds = new Set<string>(slotsInTarget.map((s: TeamSlot) => s.playerId));
    const candidates = updatedPlayers.filter(p => isPlayerEligible(p) && !inTargetIds.has(p.id));
    const chosen = choosePlayersForBonus(candidates, 1, btCount)[0];
    if (chosen) {
      const slot: TeamSlot = { playerId: chosen.id, slotType: 'bonus' };
      if (target.teams.teamA.length < 3) target.teams.teamA.push(slot);
      else target.teams.teamB.push(slot);
      bumpBonus(chosen.id);
    }
  }

  // Remove any game that ends up only with Bonus slots
  games = games.filter(g => !gameHasOnlyBonus(g));
  // Re-index
  games = games.map((g, idx) => ({ ...g, index: idx }));

  const updatedBigToss: BigToss = { ...bigToss, games };
  return { bigToss: updatedBigToss, players: updatedPlayers };
}
