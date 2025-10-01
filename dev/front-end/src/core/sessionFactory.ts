/**
 * Factory functions for creating new Session and Player instances
 */

import type { Session, Player, SessionSettings } from '../types/models';
import { generateId } from '../utils';

export const createDefaultSettings = (): SessionSettings => ({
  allowConcurrentGames: false,
});

export const createNewSession = (): Session => ({
  id: generateId(),
  createdAt: Date.now(),
  version: 1,
  players: [],
  bigTosses: [],
  settings: createDefaultSettings(),
  status: 'active',
});

export const createNewPlayer = (name: string): Player => ({
  id: generateId(),
  name: name.trim(),
  joinedAt: Date.now(),
  active: true,
  available: true,
  sessionStats: {
    gamesPlayed: 0,
    filledGamesPlayed: 0,
    refsMain: 0,
    refsAssistant: 0,
    lastPlayedAt: null,
    lastRefedAt: null,
  },
  bigTossStats: {
    gamesPlayed: 0,
  },
});


