/**
 * localStorage persistence utilities
 */

import type { Session } from '../types/models';

const STORAGE_KEY = 'pickup.session.active';
const STORAGE_VERSION = 1;

interface StorageData {
  version: number;
  session: Session;
}

export const saveSession = (session: Session): void => {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      session,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save session to localStorage:', error);
  }
};

export const loadSession = (): Session | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const data: StorageData = JSON.parse(stored);
    
    // Version migration logic (for future use)
    if (data.version !== STORAGE_VERSION) {
      console.warn('Session version mismatch, migration may be needed');
      // TODO: Implement migration logic when needed
    }

    return data.session;
  } catch (error) {
    console.error('Failed to load session from localStorage:', error);
    return null;
  }
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear session from localStorage:', error);
  }
};


