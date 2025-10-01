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

### US-001 Create a new Session ✅ DONE
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
- **Implementation Details**:
  - **SessionToolbar**: New/Reset buttons with confirmation dialogs, gradient styling, mobile responsive
  - **SessionSummary**: Displays session info (created date, player/big toss counts), hidden session ID
  - **State management**: Context API with reducer pattern, localStorage persistence with versioning
  - **Error handling**: User-friendly error messages, confirmation dialogs for destructive actions
  - **Mobile optimization**: Responsive design, compact button layouts, proper touch targets

### US-002 View Session dashboard ✅ DONE
As an organizer, I want a dashboard to see players, schedule, and stats.

- Acceptance Criteria
  - Shows player list with counts: total, active (eligible), currently playing, currently reffing
  - Shows current Big Toss with list of Games in order and their statuses (scheduled, playing, completed)
  - Shows aggregate stats: per-player games played, filled games played, reffing count (main/assistant), fairness indicators
- Implementation Notes
  - Provide tabs: Players | Schedule | Stats
- **Implementation Details**:
  - **SessionDashboard**: Tabbed interface (Players/Schedule/Stats) with responsive design
  - **Player stats cards**: 4-card grid showing total/active/playing/reffing counts with color coding
  - **Schedule display**: Big Toss cards with games, status badges, delete functionality
  - **UI improvements**: Orange/pink gradient theme, Bungee Inline font for logo, mobile-first design
  - **Empty states**: Helpful icons and messages when no data exists
  - **Tab navigation**: Pill-style tabs with count badges, smooth transitions

### US-003 Manage players in Session ✅ DONE
As an organizer, I want to add or remove players from the Session.

- Acceptance Criteria
  - Can add player by name (require unique non-empty string; trim; case-insensitive uniqueness)
  - Can remove player if not currently assigned to an in-progress Game; confirm removal effect
  - Player object: { id, name, joinedAt, active: true }
  - Persist changes to localStorage immediately
- Implementation Notes
  - Show error message on duplicate names
- **Implementation Details**:
  - **PlayerList component**: Integrated into Players tab with inline add player functionality
  - **Add player**: Input field at top of roster with small "Add" button, Enter key support
  - **Player management**: Toggle availability (green/gray circles), remove with confirmation dialog
  - **Validation**: Duplicate name prevention (case-insensitive), empty name handling
  - **Auto-regeneration**: Adding/removing players automatically updates scheduled Big Toss
  - **Visual indicators**: Status badges (Available/Unavailable/Inactive), join dates
  - **Error handling**: Inline error messages for validation failures
  - **Mobile optimization**: Responsive layout, compact buttons, proper touch targets

### US-004 Start a Big Toss ✅ DONE
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
- **Implementation Details**:
  - **SessionToolbar**: Added "Generate Big Toss" button with conditional display (only shows when session exists)
  - **Smart validation**: Button disabled when < 6 eligible players, shows tooltip with current count
  - **Visual feedback**: Green gradient when enabled, gray when disabled, lightning bolt icon
  - **Auto-regeneration**: When adding/removing players, existing scheduled Big Toss automatically recalculates
  - **Delete functionality**: Each Big Toss has trash icon with confirmation dialog
  - **Sequential numbering**: Fixed display numbering to use array position instead of stored index
  - **Core integration**: Uses existing `generateGames()` and `assignRefsToGames()` algorithms
  - **Error handling**: Alert messages for insufficient players, graceful failure handling
  - **Persistence**: All changes automatically saved to localStorage
  - **Mobile responsive**: Button text adapts ("Generate Big Toss" → "Big Toss" on mobile)
- **Storage versioning**: Added localStorage version check (STORAGE_VERSION=2); shows a modal on mismatch and clears storage on user acknowledge
- **User notice modal**: Warns about data format update with "I understand" action to clear outdated data
- **Developer note**: When changing the saved data format in future development, update STORAGE_VERSION in `src/utils/localStorage.ts`

### US-005 Compose Games (team building)
As an organizer, I want each Game to have two teams of 3 players with a flexible Reserved/Bonus Slot system so roster changes can be handled fairly during a Big Toss.

- Acceptance Criteria
  - Core game composition
    - Each scheduled Game has exactly 6 unique player slots divided into two teams of 3
    - No player may occupy more than one slot in the same Game
    - Teams are initially balanced by minimizing repeated pairings within the Big Toss
  - Slot types and semantics
    - Each player has at most one Reserved Slot per Big Toss (ensures they play at least one Game in that Big Toss)
    - A "Bonus Slot" is a slot occupied by a player who already has a Reserved Slot (or had already played in the Big Toss)
    - A Game can contain any mix of Reserved and Bonus slots
    - If a Game ends up containing only Bonus slots, that Game is deleted immediately (not only on add/remove events)
  - Generation from player list (unlimited size)
    - Initial generation from N players: create ceil(N/6) Games so each player gets exactly one Reserved slot in that Big Toss
    - With exactly 6 players: create a single Game with 6 Reserved slots
    - If the last Game has fewer than 6 players after assigning all Reserved slots, fill its remaining slots as Bonus slots selected from existing players according to fairness rules
    - When players are added beyond multiples of 6 during a running Big Toss, create additional Games as needed so each newly added player receives one Reserved Slot in the current Big Toss
  - Fairness for Bonus slot attribution and displacement
    - Preference for occupying Bonus slots goes to players with the fewest session Bonus slots used
    - Tie-breakers: fewest games in current Big Toss, earliest lastPlayedAt, then alphabetical by name
    - If multiple candidates have no lastPlayedAt, use joinedAt, then alphabetical by name
    - When a new player is added and must take over a Bonus slot, select the Bonus occupant with the highest session Bonus slot count (reverse of the above priority) with the same tie-breakers, preferring the earliest game that has Bonus slots
  - Handling adds during a running Big Toss
    - Adding the 7th player (from 6) creates a second Game where the new player takes a Reserved Slot and five other players fill Bonus slots
    - Adding players up to 12 creates or populates Games so each new player gets exactly one Reserved Slot in the current Big Toss
  - Handling removals during a running Big Toss
    - If a player in a Reserved Slot is removed and another Game exists that contains only Bonus slots, move a Reserved player from the later Game into the vacancy to minimize the number of Games; if the moved player had their only Reserved Slot in that later Game and no Reserved slots remain there, delete that later Game (games containing only Bonus slots are deleted immediately)
    - If a player in a Reserved Slot is removed and no later game contains only Bonus slots, keep the number of Games unchanged and directly select a fair replacement to fill that Reserved slot (Option B). The replacement is chosen using the Bonus fairness priority, restricted to eligible players not currently in the same Game.
    - If a removed player was in a Bonus slot, simply re-run Bonus filling on the affected Game while keeping Reserved slots unchanged
  - Persistence and integrity
    - Slot type (Reserved/Bonus) must be stored per slot for auditability
    - Prevent duplicates within the same Game
    - Persist changes immediately to storage and maintain deterministic behavior under rapid add/remove operations
    - When multiple adds/removes occur nearly simultaneously, process them sequentially in a deterministic order: by event timestamp, then by player name
- Implementation Notes
  - Data model for teams in a `Game` should include slot metadata:
    - teams: { teamA: [{ playerId, slotType: 'reserved'|'bonus' } x3], teamB: [{ playerId, slotType: 'reserved'|'bonus' } x3] }
  - Introduce helpers:
    - generateGames(initialPlayers)
    - addPlayerToBigToss(newPlayer)
    - removePlayerFromBigToss(playerId)
    - fillBonusSlotsForGame(game)
    - findGameWithOnlyBonusSlots()
    - chooseBonusOccupantsByFairness()
  - Example lineups shown in scenarios are illustrative only; actual allocations may differ while meeting fairness and constraints
  - Session-scope counters: session Bonus slot counts reset when a new Session starts and accumulate across all Big Tosses within the Session

#### Gherkin scenarios for US-005

```gherkin
Feature: US-005 Compose Games (team building)
  As an organizer
  I want two teams of 3 players per Game with Reserved and Bonus slots
  So that roster changes during a Big Toss are handled fairly and consistently

  Background:
    Given an active Session with an empty Big Toss
    And the fairness priority for Bonus slots is: fewest session bonus slots, then fewest games in current Big Toss, then earliest lastPlayedAt, then name

  # case 1
  Scenario: Exactly 6 players create a single game of 3v3 with all Reserved slots
    Given the player list is [A, B, C, D, E, F]
    When I generate the Big Toss
    Then there is exactly 1 game in the Big Toss
    And game 1 has two teams of 3 players each
    And all 6 slots in game 1 are Reserved
    And the players in game 1 are a permutation of [A, B, C, D, E, F]

  # case 2 - Adding 7th player creates second game with new player's Reserved slot
  Scenario: Adding G to 6 players creates a second game with G Reserved and others Bonus
    Given the player list is [A, B, C, D, E, F]
    And I have generated the Big Toss
    When I add player G
    Then there are exactly 2 games in the Big Toss
    And in game 1, all 6 slots remain Reserved
    And in game 2, player G occupies a Reserved slot
    And the remaining 5 slots in game 2 are Bonus slots occupied by players from [A, B, C, D, E, F]
    And no player appears twice within the same game
    And an example valid allocation for game 2 is teamA [G, A, B] and teamB [C, D, E]

  # case: 10 players at once -> ceil(10/6) = 2 games; second game has 4 Reserved, 2 Bonus
  Scenario: Exactly 10 players create two games; leftover slots in game 2 are Bonus
    Given the player list is [A, B, C, D, E, F, G, H, I, J]
    When I generate the Big Toss
    Then there are exactly 2 games in the Big Toss
    And in game 1, all 6 slots are Reserved
    And in game 2, exactly 4 slots are Reserved and 2 slots are Bonus
    And Reserved slots in game 2 are assigned to players [G, H, I, J] (permutation allowed)
    And Bonus slots in game 2 are chosen by fairness from among [A, B, C, D, E, F]

  # case 2 - Removing C after adding G consolidates G into game 1 and deletes game 2
  Scenario: Removing a Reserved player consolidates a later game with only Bonus slots
    Given the player list is [A, B, C, D, E, F]
    And I have generated the Big Toss
    And I add player G
    And there are 2 games with G Reserved in game 2 and all other game 2 slots Bonus
    When I remove player C
    Then game 1 now includes G occupying the vacated slot as Reserved
    And game 2 has only Bonus slots remaining
    And game 2 is deleted
    And there is exactly 1 game in the Big Toss
    And the players remaining are [A, B, D, E, F, G]

  # From 6 players (after removal) add two players H and I
  Scenario: Adding H and I creates a second game with both Reserved and others Bonus
    Given the player list is [A, B, D, E, F, G]
    And I have generated the Big Toss so there is exactly 1 game
    When I add players H, I
    Then there are exactly 2 games in the Big Toss
    And in game 2, players H and I each occupy a Reserved slot
    And the remaining 4 slots in game 2 are Bonus slots from among [A, B, D, E, F, G]
    And no player appears twice within the same game
    And an example valid allocation for game 2 is teamA [H, I, A] and teamB [B, C, D] if C exists, otherwise choose by fairness

  # From 8 players add J; J takes over a Bonus slot which becomes Reserved for J
  Scenario: Adding J converts an existing Bonus slot to Reserved and displaces fairly
    Given the player list is [A, B, D, E, F, G, H, I]
    And I have generated the Big Toss resulting in 2 games where H and I have Reserved slots in game 2 and other slots are Bonus
    When I add player J
    Then player J takes over a Bonus slot in an existing game (prefer the earliest game with Bonus slots)
    And that slot becomes Reserved for J
    And the displaced player is selected by highest session Bonus slot count (breaking ties by fewest games in current Big Toss, earliest lastPlayedAt, then name)
    And there are still exactly 2 games in the Big Toss
    And an example valid allocation for game 2 is teamA [H, I, J] and teamB [A, B, D] subject to fairness rules

  # Removal from a Reserved slot with no collapsible game -> direct replacement (Option B)
  Scenario: Removing a Reserved player without a Bonus-only game keeps game count and fills directly
    Given the player list is [A, B, C, D, E, F, G, H, I, J]
    And I have generated the Big Toss producing 2 games
    And all games have at least one Reserved slot
    When I remove player A who was in a Reserved slot in game 1
    And there is no later game containing only Bonus slots
    Then the number of games remains 2
    And a fair replacement is chosen to fill A's Reserved slot in game 1 using the Bonus fairness priority among eligible players not in game 1
    And no player appears twice within the same game

  # General fairness validation for Bonus attribution
  Scenario Outline: Bonus slots are assigned to players with the fewest session bonus participations
    Given an active Big Toss with <initialCount> players and <bonusCount> bonus slots to fill
    And per-player session bonus counts are <bonusCounts>
    When I allocate bonus slots
    Then the set of players chosen for bonus slots minimizes session bonus counts
    And ties are broken by fewest games in current Big Toss, earliest lastPlayedAt, then name

    Examples:
      | initialCount | bonusCount | bonusCounts                          |
      | 7            | 5          | A:0,B:0,C:0,D:0,E:0,F:0,G:0         |
      | 8            | 4          | A:2,B:1,C:1,D:0,E:0,F:0,G:0,H:0     |
      | 10           | 2          | A:1,B:1,C:0,D:0,E:0,F:0,G:0,H:0,I:0,J:0 |
      | 11           | 5          | A:3,B:2,C:2,D:1,E:1,F:1,G:1,H:0,I:0,J:0,K:0 |
```

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
