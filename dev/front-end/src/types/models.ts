/**
 * Core data models for Pickup! app
 * Based on TASKS.md data model specification
 */

export type GameStatus = 'scheduled' | 'playing' | 'completed';
export type BigTossStatus = 'scheduled' | 'completed';
export type SessionStatus = 'active';

export interface PlayerSessionStats {
  gamesPlayed: number;
  filledGamesPlayed: number;
  refsMain: number;
  refsAssistant: number;
  lastPlayedAt: number | null;
  lastRefedAt: number | null;
}

export interface PlayerBigTossStats {
  gamesPlayed: number;
}

export interface Player {
  id: string;
  name: string;
  joinedAt: number;
  active: boolean;
  available: boolean;
  sessionStats: PlayerSessionStats;
  bigTossStats: PlayerBigTossStats;
}

export interface GameTeams {
  teamA: string[]; // Player IDs (3 players)
  teamB: string[]; // Player IDs (3 players)
}

export interface GameRefs {
  mainId: string;
  assistantId: string;
}

export interface Game {
  id: string;
  index: number;
  bigTossId: string;
  status: GameStatus;
  teams: GameTeams;
  refs: GameRefs;
  isToFill?: boolean;
  overrides?: boolean;
}

export interface BigToss {
  id: string;
  index: number;
  createdAt: number;
  games: Game[];
  status: BigTossStatus;
}

export interface SessionSettings {
  allowConcurrentGames: boolean;
}

export interface Session {
  id: string;
  createdAt: number;
  version: number;
  players: Player[];
  bigTosses: BigToss[];
  settings: SessionSettings;
  status: SessionStatus;
}

export interface SessionState {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}


