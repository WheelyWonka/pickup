import React from 'react';
import { useSession } from '../../store/SessionContext';

const SessionToolbar: React.FC = () => {
  const { state, createSession, resetSession } = useSession();
  const hasActiveSession = !!state.session;

  const handleNewSession = () => {
    if (hasActiveSession) {
      const ok = window.confirm(
        'A session is already active. Creating a new one will discard the current session. Continue?'
      );
      if (!ok) return;
    }
    createSession();
  };

  const handleReset = () => {
    const ok = window.confirm('This will clear the active session from localStorage. Continue?');
    if (!ok) return;
    resetSession();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleNewSession}
        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Create new session"
      >
        New Session
      </button>
      <button
        type="button"
        onClick={handleReset}
        className="inline-flex items-center gap-2 rounded-md bg-gray-200 text-gray-800 px-4 py-2 text-sm font-medium shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        aria-label="Reset session"
      >
        Reset
      </button>
    </div>
  );
};

export default SessionToolbar;
