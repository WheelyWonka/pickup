/**
 * Session Context for global state management
 * Provides session state and actions to the entire app
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Session, BigToss, TeamSlot } from '../types/models';
import { createNewSession, createNewPlayer, generateGames, assignRefsToGames, addPlayerToBigToss, removePlayerFromBigToss } from '../core';
import { saveSession, loadSession, clearSession, generateId, getStoredDataVersion, STORAGE_VERSION } from '../utils';

interface SessionState {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  showVersionModal: boolean;
}

type SessionAction =
  | { type: 'LOAD_SESSION'; payload: Session | null }
  | { type: 'CREATE_SESSION' }
  | { type: 'RESET_SESSION' }
  | { type: 'ADD_PLAYER'; payload: string }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'TOGGLE_PLAYER_AVAILABILITY'; payload: string }
  | { type: 'GENERATE_BIG_TOSS' }
  | { type: 'DELETE_BIG_TOSS'; payload: string }
  | { type: 'UPDATE_GAME_TEAMS'; payload: { gameId: string; teams: { teamA: TeamSlot[]; teamB: TeamSlot[] } } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SHOW_VERSION_MODAL' }
  | { type: 'HIDE_VERSION_MODAL' };

interface SessionContextType {
  state: SessionState;
  createSession: () => void;
  resetSession: () => void;
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  togglePlayerAvailability: (playerId: string) => void;
  generateBigToss: () => void;
  deleteBigToss: (bigTossId: string) => void;
  updateGameTeams: (gameId: string, teams: { teamA: TeamSlot[]; teamB: TeamSlot[] }) => void;
  acknowledgeVersionMismatch: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const sessionReducer = (state: SessionState, action: SessionAction): SessionState => {
  switch (action.type) {
    case 'LOAD_SESSION':
      return {
        ...state,
        session: action.payload,
        isLoading: false,
      };

    case 'CREATE_SESSION': {
      const newSession = createNewSession();
      saveSession(newSession);
      return {
        ...state,
        session: newSession,
        error: null,
      };
    }

    case 'RESET_SESSION':
      clearSession();
      return {
        ...state,
        session: null,
        error: null,
      };

    case 'ADD_PLAYER': {
      if (!state.session) return state;

      const name = action.payload.trim();
      if (!name) {
        return { ...state, error: 'Player name cannot be empty' };
      }

      // Check for duplicate names (case-insensitive)
      const nameExists = state.session.players.some(
        p => p.name.toLowerCase() === name.toLowerCase()
      );

      if (nameExists) {
        return { ...state, error: `Player "${name}" already exists` };
      }

      const newPlayer = createNewPlayer(name);
      let updatedSession = {
        ...state.session,
        players: [...state.session.players, newPlayer],
      };

      // If there is a currently scheduled Big Toss, regenerate it to include new players
      if (updatedSession.bigTosses.length > 0) {
        let scheduledIndex = -1;
        for (let i = updatedSession.bigTosses.length - 1; i >= 0; i--) {
          if (updatedSession.bigTosses[i].status === 'scheduled') {
            scheduledIndex = i;
            break;
          }
        }

        if (scheduledIndex >= 0) {
          const existing = updatedSession.bigTosses[scheduledIndex];
          try {
            const adj = addPlayerToBigToss(existing, updatedSession.players, newPlayer.id);
            // Use all prior games across session for fairness counts
            const historyGames = updatedSession.bigTosses
              .flatMap((bt, idx) => (idx === scheduledIndex ? [] : bt.games));
            const gamesWithRefs = assignRefsToGames(adj.bigToss.games, adj.players, historyGames);
            const regenerated = { ...adj.bigToss, games: gamesWithRefs };
            const newBigTosses = [...updatedSession.bigTosses];
            newBigTosses[scheduledIndex] = regenerated;
            updatedSession = { ...updatedSession, bigTosses: newBigTosses, players: adj.players };
          } catch {
            // ignore if adjustment fails
          }
        }
      }

      saveSession(updatedSession);
      return {
        ...state,
        session: updatedSession,
        error: null,
      };
    }

    case 'REMOVE_PLAYER': {
      if (!state.session) return state;

      let updatedSession = {
        ...state.session,
        players: state.session.players.filter(p => p.id !== action.payload),
      };

      // If there is a currently scheduled Big Toss, regenerate it after removal
      if (updatedSession.bigTosses.length > 0) {
        let scheduledIndex = -1;
        for (let i = updatedSession.bigTosses.length - 1; i >= 0; i--) {
          if (updatedSession.bigTosses[i].status === 'scheduled') {
            scheduledIndex = i;
            break;
          }
        }

        if (scheduledIndex >= 0) {
          const existing = updatedSession.bigTosses[scheduledIndex];
          try {
            const adj = removePlayerFromBigToss(existing, updatedSession.players, action.payload);
            // Use all prior games across session for fairness counts
            const historyGames = updatedSession.bigTosses
              .flatMap((bt, idx) => (idx === scheduledIndex ? [] : bt.games));
            const gamesWithRefs = assignRefsToGames(adj.bigToss.games, adj.players, historyGames);
            const regenerated = { ...adj.bigToss, games: gamesWithRefs };
            const newBigTosses = [...updatedSession.bigTosses];
            newBigTosses[scheduledIndex] = regenerated;
            updatedSession = { ...updatedSession, bigTosses: newBigTosses, players: adj.players };
          } catch {
            // If adjustment fails, remove the scheduled Big Toss as it is no longer valid
            const newBigTosses = updatedSession.bigTosses.filter((_, idx) => idx !== scheduledIndex);
            updatedSession = { ...updatedSession, bigTosses: newBigTosses };
          }
        }
      }

      saveSession(updatedSession);
      return {
        ...state,
        session: updatedSession,
        error: null,
      };
    }

    case 'TOGGLE_PLAYER_AVAILABILITY': {
      if (!state.session) return state;

      const updatedSession = {
        ...state.session,
        players: state.session.players.map(p =>
          p.id === action.payload ? { ...p, available: !p.available } : p
        ),
      };

      saveSession(updatedSession);
      return {
        ...state,
        session: updatedSession,
        error: null,
      };
    }

    case 'GENERATE_BIG_TOSS': {
      if (!state.session) return state;

      try {
        const bigTossId = generateId();
        // Use the current length as the index to ensure sequential numbering
        const bigTossIndex = state.session.bigTosses.length;

        // Generate games with team assignments
        const result = generateGames({
          players: state.session.players,
          bigTossId,
          startIndex: 0,
        });

        // Assign refs to all games using session history up to now
        const historyGames = state.session.bigTosses.flatMap(bt => bt.games);
        const gamesWithRefs = assignRefsToGames(result.games, result.updatedPlayers, historyGames);

        const newBigToss: BigToss = {
          id: bigTossId,
          index: bigTossIndex,
          createdAt: Date.now(),
          games: gamesWithRefs,
          status: 'scheduled',
        };

        const updatedSession = {
          ...state.session,
          players: result.updatedPlayers,
          bigTosses: [...state.session.bigTosses, newBigToss],
        };

        saveSession(updatedSession);
        return {
          ...state,
          session: updatedSession,
          error: null,
        };
      } catch (error) {
        return {
          ...state,
          error: error instanceof Error ? error.message : 'Failed to generate Big Toss',
        };
      }
    }

    case 'DELETE_BIG_TOSS': {
      if (!state.session) return state;
      const bigTossId = action.payload;
      const filtered = state.session.bigTosses.filter(bt => bt.id !== bigTossId);
      const updatedSession = { ...state.session, bigTosses: filtered };
      saveSession(updatedSession);
      return { ...state, session: updatedSession, error: null };
    }

    case 'UPDATE_GAME_TEAMS': {
      if (!state.session) return state;
      const { gameId, teams } = action.payload;
      
      const updatedSession = {
        ...state.session,
        bigTosses: state.session.bigTosses.map(bigToss => ({
          ...bigToss,
          games: bigToss.games.map(game => 
            game.id === gameId 
              ? { ...game, teams, overrides: true }
              : game
          ),
        })),
      };
      
      saveSession(updatedSession);
      return { ...state, session: updatedSession, error: null };
    }

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SHOW_VERSION_MODAL':
      return { ...state, showVersionModal: true };

    case 'HIDE_VERSION_MODAL':
      return { ...state, showVersionModal: false };

    default:
      return state;
  }
};

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(sessionReducer, {
    session: null,
    isLoading: true,
    error: null,
    showVersionModal: false,
  });

  // Load session from localStorage on mount
  useEffect(() => {
    const storedVersion = getStoredDataVersion();
    if (storedVersion !== null && storedVersion !== STORAGE_VERSION) {
      // show modal; do not load incompatible data
      dispatch({ type: 'SHOW_VERSION_MODAL' });
      dispatch({ type: 'LOAD_SESSION', payload: null });
      return;
    }

    const savedSession = loadSession();
    dispatch({ type: 'LOAD_SESSION', payload: savedSession });
  }, []);

  const contextValue: SessionContextType = {
    state,
    createSession: () => dispatch({ type: 'CREATE_SESSION' }),
    resetSession: () => dispatch({ type: 'RESET_SESSION' }),
    addPlayer: (name: string) => dispatch({ type: 'ADD_PLAYER', payload: name }),
    removePlayer: (playerId: string) => dispatch({ type: 'REMOVE_PLAYER', payload: playerId }),
    togglePlayerAvailability: (playerId: string) =>
      dispatch({ type: 'TOGGLE_PLAYER_AVAILABILITY', payload: playerId }),
    generateBigToss: () => dispatch({ type: 'GENERATE_BIG_TOSS' }),
    deleteBigToss: (bigTossId: string) => dispatch({ type: 'DELETE_BIG_TOSS', payload: bigTossId }),
    updateGameTeams: (gameId: string, teams: { teamA: TeamSlot[]; teamB: TeamSlot[] }) =>
      dispatch({ type: 'UPDATE_GAME_TEAMS', payload: { gameId, teams } }),
    acknowledgeVersionMismatch: () => {
      clearSession();
      dispatch({ type: 'HIDE_VERSION_MODAL' });
    },
  };

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};


