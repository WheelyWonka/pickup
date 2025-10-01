/**
 * Team generation logic for Big Toss
 * Creates balanced 3v3 teams from available players
 */

import type { Player, Game } from '../types/models';
import { shuffle, generateId } from '../utils';

export interface GenerateGamesOptions {
  players: Player[];
  bigTossId: string;
  startIndex?: number;
}

/**
 * Generate games for a Big Toss
 * Algorithm: Shuffle players and create 3v3 games, marking last game as "to fill" if needed
 */
export const generateGames = (options: GenerateGamesOptions): Game[] => {
  const { players, bigTossId, startIndex = 0 } = options;
  
  // Filter available and active players
  const eligiblePlayers = players.filter(p => p.active && p.available);
  
  if (eligiblePlayers.length < 6) {
    throw new Error('At least 6 players required to generate games');
  }

  // Shuffle players for fairness
  const shuffledPlayers = shuffle(eligiblePlayers);
  
  // Calculate number of complete games
  const numGames = Math.floor(shuffledPlayers.length / 6);
  const games: Game[] = [];
  
  let playerIndex = 0;
  
  for (let i = 0; i < numGames; i++) {
    const gamePlayers = shuffledPlayers.slice(playerIndex, playerIndex + 6);
    playerIndex += 6;
    
    games.push({
      id: generateId(),
      index: startIndex + i,
      bigTossId,
      status: 'scheduled',
      teams: {
        teamA: gamePlayers.slice(0, 3).map(p => p.id),
        teamB: gamePlayers.slice(3, 6).map(p => p.id),
      },
      refs: {
        mainId: '', // Will be assigned by ref selector
        assistantId: '', // Will be assigned by ref selector
      },
    });
  }
  
  // Handle remaining players (if any) - create a "to fill" game
  const remainingPlayers = shuffledPlayers.slice(playerIndex);
  if (remainingPlayers.length > 0) {
    const teamA: string[] = [];
    const teamB: string[] = [];
    
    // Distribute remaining players
    remainingPlayers.forEach((player, idx) => {
      if (idx % 2 === 0) {
        teamA.push(player.id);
      } else {
        teamB.push(player.id);
      }
    });
    
    games.push({
      id: generateId(),
      index: startIndex + numGames,
      bigTossId,
      status: 'scheduled',
      teams: { teamA, teamB },
      refs: {
        mainId: '', // Will be assigned by ref selector
        assistantId: '', // Will be assigned by ref selector
      },
      isToFill: true,
    });
  }
  
  return games;
};


