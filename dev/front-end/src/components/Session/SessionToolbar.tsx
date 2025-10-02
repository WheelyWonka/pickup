import React from 'react';
import { useSession } from '../../store/SessionContext';
import ConfirmButton from '../common/ConfirmButton';

const SessionToolbar: React.FC = () => {
  const { state, createSession, generateBigToss } = useSession();
  const hasActiveSession = !!state.session;
  const eligiblePlayers = state.session?.players.filter(p => p.active && p.available) || [];
  const canGenerateBigToss = eligiblePlayers.length >= 6;

  const handleCreate = () => createSession();

  const handleGenerateBigToss = () => {
    if (!canGenerateBigToss) {
      alert(`You need at least 6 active players to generate a Big Toss. Currently have ${eligiblePlayers.length} eligible players.`);
      return;
    }
    generateBigToss();
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      {hasActiveSession ? (
        <ConfirmButton
          message="A session is already active. Creating a new one will discard the current session. Continue?"
          onConfirm={handleCreate}
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          aria-label="Create new session"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="hidden sm:inline">New Session</span>
          <span className="sm:hidden">New</span>
        </ConfirmButton>
      ) : (
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          aria-label="Create new session"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="hidden sm:inline">New Session</span>
          <span className="sm:hidden">New</span>
        </button>
      )}
      
      {hasActiveSession && (
        <button
          type="button"
          onClick={handleGenerateBigToss}
          disabled={!canGenerateBigToss}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            canGenerateBigToss
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white focus:ring-green-400'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed transform-none'
          }`}
          aria-label="Generate Big Toss"
          title={!canGenerateBigToss ? `Need 6+ players (currently ${eligiblePlayers.length})` : 'Generate Big Toss'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="hidden sm:inline">Generate Big Toss</span>
          <span className="sm:hidden">Big Toss</span>
        </button>
      )}
      
    </div>
  );
};

export default SessionToolbar;
