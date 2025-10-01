import React from 'react';
import { useSession } from '../../store/SessionContext';

const SessionSummary: React.FC = () => {
  const { state } = useSession();
  const session = state.session;

  if (!session) {
    return (
      <div className="rounded-xl border-2 border-dashed border-orange-200 bg-gradient-to-br from-orange-50 to-pink-50 p-4 sm:p-6 text-center">
        <div className="text-orange-500 mb-3">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium text-sm sm:text-base">No active session</p>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">Click "New Session" to start managing your pickup games</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-white to-orange-50/30 p-4 sm:p-6 shadow-md border border-orange-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="text-center sm:text-left">
          <div className="text-pink-500 text-xs sm:text-sm font-semibold uppercase tracking-wide">Created</div>
          <div className="text-gray-800 font-medium mt-1 text-sm sm:text-base">{new Date(session.createdAt).toLocaleString()}</div>
        </div>
        <div className="text-center sm:text-left">
          <div className="text-gray-500 text-xs sm:text-sm font-semibold uppercase tracking-wide">Overview</div>
          <div className="text-gray-800 font-medium mt-1 text-sm sm:text-base">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                {session.players.length} Players
              </span>
              <span className="hidden sm:inline text-gray-400">•</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                {session.bigTosses.length} Big Tosses
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;
