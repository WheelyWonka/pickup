/**
 * Session Context for global state management
 * Provides session state and actions to the entire app
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { Session, Player, BigToss } from '../types/models';
import { createNewSession, createNewPlayer, generateGames, assignRefsToGames } from '../core';
import { saveSession, loadSession, clearSession, generateId } from '../utils';

interface SessionState {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

type SessionAction =
  | { type: 'LOAD_SESSION'; payload: Session | null }
  | { type: 'CREATE_SESSION' }
  | { type: 'RESET_SESSION' }
  | { type: 'ADD_PLAYER'; payload: string }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'TOGGLE_PLAYER_AVAILABILITY'; payload: string }
  | { type: 'GENERATE_BIG_TOSS' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

interface SessionContextType {
  state: SessionState;
  createSession: () => void;
  resetSession: () => void;
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  togglePlayerAvailability: (playerId: string) => void;
  generateBigToss: () => void;
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
      const updatedSession = {
        ...state.session,
        players: [...state.session.players, newPlayer],
      };

      saveSession(updatedSession);
      return {
        ...state,
        session: updatedSession,
        error: null,
      };
    }

    case 'REMOVE_PLAYER': {
      if (!state.session) return state;

      const updatedSession = {
        ...state.session,
        players: state.session.players.filter(p => p.id !== action.payload),
      };

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
        const bigTossIndex = state.session.bigTosses.length;

        // Generate games with team assignments
        let games = generateGames({
          players: state.session.players,
          bigTossId,
          startIndex: 0,
        });

        // Assign refs to all games
        games = assignRefsToGames(games, state.session.players);

        const newBigToss: BigToss = {
          id: bigTossId,
          index: bigTossIndex,
          createdAt: Date.now(),
          games,
          status: 'scheduled',
        };

        const updatedSession = {
          ...state.session,
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

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
};

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(sessionReducer, {
    session: null,
    isLoading: true,
    error: null,
  });

  // Load session from localStorage on mount
  useEffect(() => {
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


