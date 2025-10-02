/**
 * localStorage persistence utilities
 */

import type { Session } from '../types/models';

export const STORAGE_KEY = 'pickup.session.active';
export const STORAGE_VERSION = 4; // bump when data format changes

export interface StorageData {
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
      // Caller should detect and handle version mismatch
      return null;
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

export const getStoredData = (): StorageData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as StorageData;
  } catch (error) {
    console.error('Failed to read stored data from localStorage:', error);
    return null;
  }
};

export const getStoredDataVersion = (): number | null => {
  const data = getStoredData();
  return data?.version ?? null;
};


