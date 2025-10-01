import React from 'react';
import { useSession } from '../../store/SessionContext';

const SessionSummary: React.FC = () => {
  const { state } = useSession();
  const session = state.session;

  if (!session) {
    return (
      <div className="rounded-md border border-dashed border-gray-300 p-4 text-gray-600">
        No active session. Click "New Session" to start.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 p-4 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Session ID</div>
          <div className="font-mono text-gray-800 break-all">{session.id}</div>
        </div>
        <div>
          <div className="text-gray-500">Created</div>
          <div className="text-gray-800">{new Date(session.createdAt).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-500">Players / Big Tosses</div>
          <div className="text-gray-800">{session.players.length} / {session.bigTosses.length}</div>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;
