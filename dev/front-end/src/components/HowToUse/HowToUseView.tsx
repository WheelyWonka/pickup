import React from 'react';

const HowToUseView: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Quick Start Section */}
      <div className="bg-white/90 backdrop-blur-sm border border-orange-200/30 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-4 py-4 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-b border-orange-200/20">
          <h3 className="font-bold text-gray-900 text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Quick Start Guide</h3>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50/80 to-pink-50/80 border border-orange-200/30 rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Create a Session</h4>
                <p className="text-gray-700 text-sm">Click "New Session" to start fresh. This creates a new game session where you can manage players and generate games.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50/80 to-pink-50/80 border border-orange-200/30 rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Add Players</h4>
                <p className="text-gray-700 text-sm">Add at least 6 players to your session. Use the "Add Player" input field in the Players tab. Each player needs a unique name.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50/80 to-pink-50/80 border border-orange-200/30 rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Generate Big Toss</h4>
                <p className="text-gray-700 text-sm">Once you have 6+ players, click "Generate Big Toss" to create fair 3v3 games with referee assignments. The system automatically balances teams and assigns refs.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50/80 to-pink-50/80 border border-orange-200/30 rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">View Schedule & Stats</h4>
                <p className="text-gray-700 text-sm">Check the Schedule tab to see your games and the Stats tab to monitor fairness and player participation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How the Logic Works Section */}
      <div className="bg-white/90 backdrop-blur-sm border border-orange-200/30 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-4 py-4 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-b border-orange-200/20">
          <h3 className="font-bold text-gray-900 text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">How the Logic Works</h3>
        </div>
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Player Slot Distribution */}
          <div>
            <h4 className="font-semibold text-gray-900 text-base mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></span>
              Player Slot Distribution
            </h4>
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Reserved Slots</span>
                </div>
                <p className="text-gray-700 text-sm">Each player gets exactly one Reserved slot per Big Toss, guaranteeing they play at least once. These are the primary slots that ensure fair participation.</p>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-orange-50/80 to-pink-50/80 border border-orange-200/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">Bonus Slots</span>
                </div>
                <p className="text-gray-700 text-sm">Additional slots filled by players who already have a Reserved slot. These are distributed fairly based on who has played the least bonus games in the session.</p>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Fairness Rules</span>
                </div>
                <p className="text-gray-700 text-sm">Bonus slots go to players with the fewest session bonus appearances, then by fewest games in current Big Toss, then by earliest last played time.</p>
              </div>
            </div>
          </div>

          {/* Ref Distribution */}
          <div>
            <h4 className="font-semibold text-gray-900 text-base mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></span>
              Referee Distribution
            </h4>
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-purple-50/80 to-violet-50/80 border border-purple-200/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">Two Refs Per Game</span>
                </div>
                <p className="text-gray-700 text-sm">Each game has exactly 2 referees: a main ref and an assistant ref. Refs cannot be players in the same game.</p>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 border border-amber-200/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Fair Assignment</span>
                </div>
                <p className="text-gray-700 text-sm">Refs are assigned based on who has reffed the least this session, then by earliest last reffed time, then alphabetically by name.</p>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-red-50/80 to-rose-50/80 border border-red-200/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Auto-Updates</span>
                </div>
                <p className="text-gray-700 text-sm">When players are added or removed, ref assignments automatically update to maintain fairness and eligibility.</p>
              </div>
            </div>
          </div>

          {/* Game Structure */}
          <div>
            <h4 className="font-semibold text-gray-900 text-base mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></span>
              Game Structure
            </h4>
            <div className="p-3 bg-gradient-to-r from-gray-50/80 to-slate-50/80 border border-gray-200/30 rounded-lg">
              <p className="text-gray-700 text-sm mb-2">Each game is a 3v3 format with:</p>
              <ul className="text-gray-700 text-sm space-y-1 ml-4">
                <li>• 6 players total (3 per team)</li>
                <li>• 2 referees (main + assistant)</li>
                <li>• Balanced team composition</li>
                <li>• Fair rotation across the session</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-white/90 backdrop-blur-sm border border-orange-200/30 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-4 py-4 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-b border-orange-200/20">
          <h3 className="font-bold text-gray-900 text-lg bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Pro Tips</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 border border-blue-200/30 rounded-lg">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-700 text-sm">Players can be added or removed during a Big Toss - the system automatically recalculates teams and refs fairly.</p>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/30 rounded-lg">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-700 text-sm">Check the Stats tab regularly to monitor fairness and ensure everyone gets equal playing time.</p>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50/80 to-violet-50/80 border border-purple-200/30 rounded-lg">
              <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-700 text-sm">The system remembers your session data in the browser, so you can refresh the page without losing progress.</p>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border border-indigo-200/30 rounded-lg">
              <svg className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <div>
                <p className="text-gray-700 text-sm font-semibold mb-1">Drag & Drop Team Adjustments</p>
                <p className="text-gray-700 text-sm">Drag a player over another player to swap their positions, or drag to the end of a team to move them. Games with manual adjustments show a "Manual" badge.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUseView;
