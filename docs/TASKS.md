## Pickup! - User Stories and COA (Criteria of Acceptance)

### Context
- Front-end only for now; all scheduling/rotation logic runs client-side.
- Persist entire Session state to localStorage.
- Entities: Session, Big Toss, Game, Player, RefAssignment.
- Team size: 3v3; Refs per game: 2 (main, assistant).

## Epics
- Session Management
- Player Roster & Updates
- Big Toss Generation & Lifecycle
- Game Composition & Filled Game Logic
- Ref Assignment Logic
- New Player Handling During Big Toss
- Statistics & Fairness Tracking
- Persistence & State Management
- UI/UX Shell & Navigation
- Testing & Quality

---

### US-001 Create a new Session
As an organizer, I want to create a new Session so I can start scheduling games.

- Acceptance Criteria
  - GIVEN the app loads with no active Session
    - WHEN I click "New Session"
    - THEN a new Session with a unique id is created with empty player list, zero stats, and no Big Toss yet
    - AND the Session is saved to localStorage
  - GIVEN an active Session exists
    - WHEN I click "New Session"
    - THEN the app prompts to confirm discarding the current active Session
    - AND on confirm, creates and switches to a fresh Session
- Implementation Notes
  - Session shape: { id, createdAt, players: [], bigTosses: [], stats: { perPlayer }, status: 'active' }
  - localStorage key: pickup.session.active

### US-002 View Session dashboard
As an organizer, I want a dashboard to see players, schedule, and stats.

- Acceptance Criteria
  - Shows player list with counts: total, active (eligible), currently playing, currently reffing
  - Shows current Big Toss with list of Games in order and their statuses (scheduled, playing, completed)
  - Shows aggregate stats: per-player games played, filled games played, reffing count (main/assistant), fairness indicators
- Implementation Notes
  - Provide tabs: Players | Schedule | Stats

### US-003 Manage players in Session
As an organizer, I want to add or remove players from the Session.

- Acceptance Criteria
  - Can add player by name (require unique non-empty string; trim; case-insensitive uniqueness)
  - Can remove player if not currently assigned to an in-progress Game; confirm removal effect
  - Player object: { id, name, joinedAt, active: true }
  - Persist changes to localStorage immediately
- Implementation Notes
  - Show error message on duplicate names

### US-004 Start a Big Toss
As an organizer, I want to generate a Big Toss cycle of Games from the current player list.

- Acceptance Criteria
  - GIVEN at least 6 players exist
    - WHEN I click "Generate Big Toss"
    - THEN the system creates N Games covering players in rotations as evenly as possible in 3v3 format
    - AND all Games are appended as the next Big Toss with status 'scheduled'
  - GIVEN fewer than 6 players
    - THEN the action is disabled with a tooltip explaining the requirement
- Implementation Notes
  - BigToss shape: { id, index, createdAt, games: [Game], status: 'scheduled' }
  - Decide N: floor(totalPlayers / 6) minimum 1; extra players become bench for Filled Game logic

### US-005 Compose Games (team building)
As an organizer, I want each Game to have two teams of 3 players.

- Acceptance Criteria
  - Each scheduled Game has exactly 6 unique players
  - Teams are balanced by minimizing repeats and distributing players fairly
  - Store teams as: { teamA: [playerId x3], teamB: [playerId x3] }
- Implementation Notes
  - Use round-robin or snake draft from shuffled roster with constraints to minimize repeated pairings within the Big Toss

### US-006 Assign refs per Game
As an organizer, I want 2 refs per Game, prioritizing those who reffed less this Session and are not playing this Game.

- Acceptance Criteria
  - Each Game has 2 refs: main and assistant
  - Refs must not be among 6 playing in that Game
  - Ref selection prioritizes players with lowest total reffing count in the Session; tie-breaker: earliest last reffed time, then name
  - Persist ref assignments in Game
- Implementation Notes
  - Game shape adds: { refs: { mainId, assistantId } }

### US-007 Handle last Game missing players (Filled Game logic)
As an organizer, I want missing player slots in the last Game of a Big Toss to be filled from those who already played in this Big Toss, prioritizing fairness.

- Acceptance Criteria
  - If last Game has < 6 players from initial distribution, mark it as "Game to fill"
  - Fill missing slots with players who already played in the current Big Toss
  - Priority order: players with lowest count of Filled Games during this Session; tie-breaker: least games played in this Big Toss; then earliest last played
  - Do not assign the same player to both teams in the same Game
- Implementation Notes
  - Track per-player counters: sessionGamesPlayed, sessionFilledGamesPlayed, sessionRefsMain, sessionRefsAssistant, bigTossGamesPlayed

### US-008 Add new players during a Big Toss
As an organizer, I want to add new players while a Big Toss is scheduled or running.

- Acceptance Criteria
  - WHEN a new player is added and there exists at least one "Game to fill" with bench substitutions possible
    - THEN the new player takes a slot from a player who had been reassigned as Filled Game participant
    - AND the replaced player returns to bench eligibility
  - WHEN no "Game to fill" exists
    - THEN create a new "Game to fill" appended at the end of the current Big Toss
    - AND apply the Filled Game logic to complete it (including refs selection)
- Implementation Notes
  - Visually flag which slots were filled by reassignments

### US-009 Advance through Games and Big Tosses
As an organizer, I want to mark Games as started and completed, and generate the next Big Toss when all are done.

- Acceptance Criteria
  - Game states: scheduled -> playing -> completed (no skipping forward; allow revert back one step)
  - When all Games in a Big Toss are completed, a new Big Toss can be generated from the current roster with fairness carry-over stats
  - Stats update on state transitions to 'completed'
- Implementation Notes
  - Prevent overlapping 'playing' Games unless explicitly allowed via a setting (default single active Game)

### US-010 View and track fairness statistics
As a participant, I want to see fair distribution of play time and reffing.

- Acceptance Criteria
  - Show per-player: games played (session), filled games played (session), games played (current Big Toss), refs main, refs assistant
  - Provide fairness indicators (e.g., highlight players with lowest counts to be prioritized next)
  - Export stats as CSV
- Implementation Notes
  - Derived fields recomputed on each state change

### US-011 Persist and restore Session
As a user, I want my Session to persist across refreshes.

- Acceptance Criteria
  - All changes persist to localStorage immediately
  - On load, the app restores the active Session if present
  - Provide "Reset Session" control that clears localStorage for the active Session key
- Implementation Notes
  - Consider versioning: { version: 1 } at root for migrations

### US-012 Edit player availability
As an organizer, I want to mark players unavailable so they are excluded from upcoming Games and ref selection.

- Acceptance Criteria
  - Toggle availability; unavailable players are not considered for team or ref selection
  - If a currently scheduled Game includes a player who becomes unavailable, flag the Game as conflicted requiring manual resolve

### US-013 Manual overrides
As an organizer, I want to manually adjust a Game (teams/refs) before it starts to resolve special cases.

- Acceptance Criteria
  - Drag-and-drop or selector UI to swap players between teams within a Game
  - Re-run ref assignment with current constraints or manually pick refs (with validation preventing players in the Game)
  - Persist overrides and do not auto-overwrite on subsequent recalculations unless explicitly requested

### US-014 Undo/redo recent actions
As a user, I want to undo/redo last actions to recover from mistakes.

- Acceptance Criteria
  - Maintain a bounded action history (e.g., last 20 actions)
  - Undo reverts to previous state and persists
  - Redo reapplies next state and persists

### US-015 UI/UX shell
As a user, I want a clean, responsive UI to operate the app.

- Acceptance Criteria
  - Responsive layout for mobile/tablet/desktop
  - Clear indicators for current Game, next Game, and bench list
  - Accessible controls with keyboard navigation for critical actions

---

## Core Algorithms (COA implementation details)

- Team Rotation Generator
  - Input: list of eligible players
  - Output: list of Games with 3v3 teams balanced to minimize repeats within Big Toss
  - Method: shuffle + round-robin chunking into groups of 6; track pair frequency map within the Big Toss; local search swaps to reduce repeated pairings

- Ref Selection
  - Candidate pool: players not in the Game and available
  - Priority: ascending by (sessionRefsTotal, lastRefedAt, name)
  - Assign first as main, second as assistant

- Filled Game Filling
  - Identify deficit in last Game
  - Candidate pool: players who already played in current Big Toss and are available
  - Priority: ascending by (sessionFilledGamesPlayed, bigTossGamesPlayed, lastPlayedAt, name)
  - Assign to missing slots ensuring uniqueness and team balance

- New Player Injection During Big Toss
  - If any Game is marked "to fill", replace a previously filled-slot player with the new player, choosing the replacement that best improves fairness (lowest sessionGamesPlayed)
  - Else create a new to-fill Game at end, then apply Filled Game Filling and Ref Selection

- State Transitions
  - scheduled -> playing: lock rosters
  - playing -> completed: increment stats and timestamps

- Persistence
  - Write-through on each state update into localStorage
  - single key: pickup.session.active; include version for future migrations

---

## Data Model (client-side)

- Player
  - { id, name, joinedAt, active, available, sessionStats: { gamesPlayed, filledGamesPlayed, refsMain, refsAssistant, lastPlayedAt, lastRefedAt }, bigTossStats: { gamesPlayed } }

- Game
  - { id, index, bigTossId, status: 'scheduled'|'playing'|'completed', teams: { teamA: [pid], teamB: [pid] }, refs: { mainId, assistantId }, isToFill?: boolean, overrides?: boolean }

- BigToss
  - { id, index, createdAt, games: Game[], status: 'scheduled'|'completed' }

- Session
  - { id, createdAt, version, players: Player[], bigTosses: BigToss[], settings: { allowConcurrentGames: false }, status: 'active' }

---

## Technical Tasks

- State store & persistence
  - Create Session store with selectors and immutable updates
  - Implement localStorage write-through and bootstrapping
  - Implement versioning/migration scaffold

- Core engine
  - Implement team generator (round-robin + pair-reduction)
  - Implement ref selector with fairness metrics
  - Implement filled game filler
  - Implement new player injection flow
  - Implement state transitions and stats updates

- UI components
  - SessionToolbar (New/Reset, Generate Big Toss)
  - PlayerList (add/remove/toggle availability)
  - ScheduleView (Games per Big Toss, states)
  - GameCard (teams, refs, state controls, manual override)
  - StatsView (per-player, export CSV)

- Utilities
  - Id generation, shuffle with seed (optional), pair frequency map
  - CSV exporter

- Testing
  - Unit tests for generators/selectors
  - Snapshot tests for UI
  - Simulated scenarios: low player count, many players, frequent new players, fairness edge cases

---

## Non-Functional Requirements
- Performance: Generate Big Toss with up to 60 players under 200ms on modern devices
- Reliability: All operations are idempotent and persist atomically client-side
- Accessibility: Keyboard navigable, ARIA roles for lists and controls
- Internationalization-ready: strings centralized for future i18n

---

## Open Questions
- How to determine number of Games per Big Toss precisely when players > 6 and not multiple of 6? (current approach uses floor and then to-fill last Game)
- Should refs be allowed to repeat across consecutive Games if pool is small? Consider a cooldown setting.
- Allow concurrent Games? Default off; could be a setting later.
