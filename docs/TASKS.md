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

#### Gherkin scenarios for US-001

```gherkin
Feature: US-001 Create a new Session
  As an organizer
  I want to start a fresh Session and persist it
  So that I can begin scheduling games

  Scenario: Creating a new Session when none exists
    Given there is no active Session in localStorage under key "pickup.session.active"
    When I click "New Session"
    Then a new Session is created with an empty player list and no Big Toss
    And the new Session is persisted to localStorage under key "pickup.session.active"

  Scenario: Prompt before replacing an existing Session
    Given an active Session exists and is loaded
    When I click "New Session"
    Then I see a confirmation dialog to discard the current Session

  Scenario: Cancel replacement keeps current Session
    Given an active Session exists and I clicked "New Session"
    When I cancel the confirmation dialog
    Then the current Session remains active and unchanged

  Scenario: Confirm replacement creates a fresh Session
    Given an active Session exists and I clicked "New Session"
    When I confirm the dialog
    Then a fresh Session is created and becomes active
    And the old Session is replaced in localStorage under key "pickup.session.active"

  Scenario: Session restores on reload
    Given an active Session was previously saved in localStorage
    When I reload the app
    Then the Session is restored from localStorage and becomes active
```

---

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

#### Gherkin scenarios for US-002

```gherkin
Feature: US-002 View Session dashboard
  As an organizer
  I want to view players, schedule, and stats at a glance
  So that I can monitor the session

  Scenario: Dashboard shows empty states
    Given there is an active Session with no players and no Big Toss
    When I open the dashboard
    Then I see empty state messages for Players, Schedule, and Stats

  Scenario: Counts reflect current roster and assignments
    Given there is an active Session with players [A, B, C, D, E, F]
    And I generate a Big Toss
    When I open the dashboard
    Then the total player count is 6
    And the "currently playing" count equals 6 for game 1 (scheduled or playing depending on state)
    And the "currently reffing" count is 0 if refs are unassigned

  Scenario: Big Toss games are listed with statuses
    Given a Big Toss exists with 2 games
    When I view the Schedule tab
    Then I see both games in order with their statuses displayed as badges

  Scenario: Stats card shows aggregate indicators
    Given at least one game has been completed
    When I open the Stats tab
    Then I see aggregate indicators such as total games played and ref counts per player
```

---

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

#### Gherkin scenarios for US-003

```gherkin
Feature: US-003 Manage players in Session
  As an organizer
  I want to add, remove, and manage player availability
  So that the roster remains accurate

  Scenario: Add a new unique player
    Given the player list is empty
    When I add a player named "Alex"
    Then Alex appears in the player list
    And the change is persisted

  Scenario: Prevent duplicate player names (case-insensitive)
    Given the player list contains "Alex"
    When I add a player named "alex"
    Then I see an error about duplicate names
    And the list remains unchanged

  Scenario: Remove a player not assigned to an in-progress game
    Given the player list contains "Brooke"
    And Brooke is not assigned to any in-progress game
    When I remove Brooke
    Then Brooke is removed from the list after confirmation

  Scenario: Prevent removal if player is in an in-progress game
    Given Casey is assigned to a game with status "playing"
    When I attempt to remove Casey
    Then I see a message that the player cannot be removed while playing

  Scenario: Toggle availability
    Given Devon is in the roster and currently available
    When I mark Devon as unavailable
    Then Devon is excluded from future team/ref selection
```

---

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

#### Gherkin scenarios for US-004

```gherkin
Feature: US-004 Start a Big Toss
  As an organizer
  I want to generate a fair set of games from the player list
  So that the session can proceed

  Scenario: Button disabled when fewer than 6 players
    Given the roster has 5 eligible players
    When I view the toolbar
    Then the "Generate Big Toss" button is disabled
    And I see a tooltip explaining at least 6 players are required

  Scenario: Create Big Toss when 6 players exist
    Given the roster has 6 eligible players
    When I click "Generate Big Toss"
    Then a Big Toss is created with exactly 1 game of 6 players
    And the Big Toss status is "scheduled"

  Scenario: Create multiple games for larger rosters
    Given the roster has 12 eligible players
    When I click "Generate Big Toss"
    Then a Big Toss is created with 2 games of 6 players each

  Scenario: Auto-recalculation on roster change
    Given a scheduled Big Toss exists
    When I add a new player
    Then the scheduled Big Toss is recalculated according to US-005 and refs per US-006
```

---

### US-005 Compose Games (team building) ✅ DONE
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

 - Implementation Details
   - Data model updates (see `dev/front-end/src/types/models.ts`):
     - Added `SlotType = 'reserved' | 'bonus'` and `TeamSlot` structure
     - Changed `GameTeams` to use `TeamSlot[]` per team (stores slot type per player)
     - Added `bonusSlotsUsed` to `Player.sessionStats` for fairness tie-breakers
   - Core algorithms:
     - `generateGames` (`dev/front-end/src/core/teamGenerator.ts`):
       - Ensures one Reserved slot per player across the Big Toss (`ceil(N/6)` games)
       - Fills remaining slots in the last game as Bonus using fairness: fewest `bonusSlotsUsed`, then fewest games in current Big Toss, then earliest `lastPlayedAt`, then name
       - Returns `{ games, updatedPlayers }` and increments `bonusSlotsUsed` for assigned Bonus slots
     - Big Toss adjustments (`dev/front-end/src/core/bigTossAdjustments.ts`):
       - `addPlayerToBigToss`: creates a new game with the new player Reserved or converts an existing Bonus to Reserved (displacing by fairness)
       - `removePlayerFromBigToss`: consolidates a vacated Reserved by moving a Reserved from a later game that becomes bonus-only (then deletes it) or applies Option B replacement using fairness
       - Option B fix: if the fairest replacement already has a Reserved in this Big Toss, assign them as Bonus instead of Reserved
   - Ref assignment (`dev/front-end/src/core/refSelector.ts`): updated to read player IDs from `TeamSlot` and excludes playing players
   - Store integration (`dev/front-end/src/store/SessionContext.tsx`):
     - Uses `generateGames` on initial Big Toss creation; reassigns refs afterwards
     - On add/remove while a Big Toss is scheduled, applies `addPlayerToBigToss`/`removePlayerFromBigToss` and reassigns refs
   - UI (`dev/front-end/src/components/Session/SessionDashboard.tsx`):
     - Schedule tab shows per-game rosters with player names and Reserved/Bonus badges, plus refs
   - Persistence/versioning (`dev/front-end/src/utils/localStorage.ts`): bumped `STORAGE_VERSION` to 4 to reflect data model changes

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

---

### US-006 Assign refs per Game ✅ DONE
As an organizer, I want 2 refs per Game, prioritizing those who reffed less this Session and are not playing this Game, and I want ref assignments to update automatically following the same update paths as player/team changes in US-005.

- Acceptance Criteria
  - Roles and eligibility
    - Each Game has exactly 2 ref roles: main and assistant
    - Refs must be distinct players and must not be among the 6 players assigned to that Game (Reserved or Bonus)
    - Only available players are eligible to ref
    - If fewer than 2 eligible refs exist:
      - Assign as many as possible
      - Leave remaining roles unassigned (null) with a visible "Needs ref" indicator
  - Fairness and selection priority
    - Candidate pool for a Game: all available players not playing in that Game
    - Sort candidates by (ascending):
      1) sessionAssignedRefsTotal (refsMainAssigned + refsAssistantAssigned across the Session, including scheduled assignments)
      2) lastRefedAt (earlier first; if missing, use joinedAt; if still tied, use name)
      3) name (alphabetical)
    - Assignment: pick first candidate as main, second as assistant
    - A player may ref multiple Games within the same Big Toss; there is no cooldown between consecutive Games by default
  - Triggers (must mirror US-005 player update paths)
    - On initial Big Toss generation: assign refs for all scheduled Games after teams are generated
    - On add player to Big Toss (new Game created or Bonus->Reserved conversion):
      - Assign refs for any newly created Games
      - Re-evaluate refs for affected Games where roster changes make existing refs ineligible (ref is now playing) or fairness changes
    - On remove player from Big Toss:
      - If a Game is deleted due to having only Bonus slots, remove its refs
      - For Games whose rosters changed, re-evaluate refs; any ref who becomes a player in that Game must be replaced
    - On manual team overrides (US-013): re-run ref selection for that Game
  - Integrity and persistence
    - Prevent assigning the same player as both main and assistant in the same Game
    - Do not assign a player as ref in a Game where they are a player (Reserved or Bonus)
    - Persist ref assignments immediately
    - Stats increment for refs (refsMain, refsAssistant, lastRefedAt) occur on Game completion; selection fairness uses assigned-to-ref counts (scheduled + completed) for distribution during scheduling
  - UI expectations
    - Display main and assistant with player names and a badge (Main/Assistant)
    - Display a clear indicator for unassigned roles (e.g., "Needs ref")

- Implementation Details
  - Ref selector (`dev/front-end/src/core/refSelector.ts`)
    - `assignRefsToGames(games, players): Game[]` recalculates refs across the provided games
    - Candidate pool excludes players in the game and unavailable/inactive
    - Fairness sorts by in-memory assigned counts across current scheduled games, then earliest `lastRefedAt`, then name
    - Supports partial pools: leaves null for unassigned roles
  - Store integration (`dev/front-end/src/store/SessionContext.tsx`)
    - After `generateGames` (US-005), refs are assigned for all scheduled games
    - After `addPlayerToBigToss`/`removePlayerFromBigToss`, affected games are re-assigned refs
  - Data model
    - `Game.refs: { mainId: string | null, assistantId: string | null }`
    - `Player.sessionStats` used for tie-breakers (`lastRefedAt`)

#### Gherkin scenarios for US-006

```gherkin
Feature: US-006 Assign refs per Game
  As an organizer
  I want two refs per Game with fair distribution and automatic updates
  So that ref assignments stay valid and balanced when rosters change

  Background:
    Given an active Session
    And the Big Toss teams are generated per US-005
    And ref fairness priority is by lowest sessionAssignedRefsTotal, then earliest lastRefedAt (joinedAt if missing), then name

  # Basic assignment with limited eligible refs
  Scenario: 7 players, game 1 has only one eligible ref
    Given the player list is [A, B, C, D, E, F]
    And I generate the Big Toss (game 1 has players [A, B, C, D, E, F])
    When I add player G and create game 2 per US-005
    Then for game 1, the eligible ref pool is [G]
    And game 1 has main assigned to G and assistant is unassigned
    And game 2 assigns two refs chosen from players not playing in game 2 by fairness

  # Ref becomes ineligible due to roster change (must be replaced)
  Scenario: A ref becomes a player in the same game after an add
    Given game 1 has players [A, B, C, D, E, F] and main ref is G
    And I add players H, I creating game 2 per US-005
    When game 1 roster changes so that G is now a player in game 1 (due to consolidation or reassignment)
    Then G must be removed as a ref from game 1
    And a new eligible ref is selected by fairness for game 1
    And if no eligible ref exists, the role remains unassigned

  # Game deletion clears refs
  Scenario: Deleting a game with only Bonus slots removes its ref assignments
    Given two games exist and game 2 contains only Bonus slots
    And game 2 has main and assistant assigned
    When game 2 is deleted per US-005 rules
    Then game 2's ref assignments are removed
    And no references to those assignments remain in state

  # Direct ref selection fairness
  Scenario Outline: Refs are selected by lowest assigned counts and earliest lastRefedAt
    Given a game with candidate refs <candidates>
    And their sessionAssignedRefsTotal are <assignedCounts>
    And their lastRefedAt are <lastRefedAt>
    When refs are assigned
    Then main is the candidate with the lowest assigned count and earliest lastRefedAt by tie-break
    And assistant is the next best candidate by the same ordering

    Examples:
      | candidates         | assignedCounts      | lastRefedAt                  |
      | [G, H]            | G:0,H:1             | G:2024-01-01,H:2024-01-02    |
      | [G, H, I]         | G:1,H:1,I:1         | G:null,H:2024-01-01,I:null   |
      | [M, N, O, P]      | M:2,N:0,O:0,P:0     | M:2024-01-01,N:null,O:null,P:2023-12-01 |

  # Partial assignment when pool is small
  Scenario: Only one eligible ref exists
    Given a game where the candidate pool is [X]
    When refs are assigned
    Then main is X
    And assistant is unassigned

  # Full reassignment on manual team overrides
  Scenario: Manual team change forces ref recalculation
    Given a scheduled game with main and assistant assigned
    When I swap players between teams in that game
    Then ref assignments for that game are recalculated
    And any ref who becomes a player is replaced by the next fair candidate

  # No cooldown between consecutive games by default
  Scenario: Same person can ref consecutive games if still the fairest
    Given two consecutive scheduled games G1 and G2
    And player Q is selected as a ref for G1 by fairness
    When assigning refs for G2
    Then Q may be selected again if they remain the fairest eligible candidate

  # Unavailability exclusion
  Scenario: Unavailable players are excluded from ref selection
    Given player R is marked unavailable
    When assigning refs for any game
    Then R is not considered in the candidate pool
```

---

### US-007 View and track fairness statistics ✅ DONE
As a participant, I want to see fair distribution of play time and reffing.

- Acceptance Criteria
  - Per-player session stats (table with sortable columns)
    - Games played (total)
    - Reserved appearances (count of Reserved slots)
    - Bonus appearances (count of Bonus slots; uses `bonusSlotsUsed`)
    - Refs main (assigned/completed)
    - Refs assistant (assigned/completed)
    - Total refs assigned (main + assistant)
    - Last played at, last reffed at
    - Bench wait (number of games since last played)
    - Consecutive games played (streak)
    - Fairness indicator (relative rank vs session median for Reserved/Bonus/Refs)
  - Per-player current Big Toss stats
    - Games played in current Big Toss
    - Has Reserved slot in current Big Toss (yes/no)
    - Bonus slots in current Big Toss (count)
    - Eligible to ref now (yes/no, with reason if no)
  - Big Toss summary
    - Number of games
    - Total Bonus slots used (count and % of all slots)
    - Players without Bonus appearances in this Big Toss
    - Distribution charts: Reserved vs Bonus per player (histogram)
  - Ref distribution summary
    - Ref coverage: games fully staffed, missing main, missing assistant
    - Ref load by player (bar chart of assigned counts)
    - Players with zero ref assignments this Session
    - Time since last ref per player
  - Pairings and rotation quality
    - Teammate pair frequency (top repeated pairs)
    - Opponent pair frequency (optional)
    - Balance metric per game (heuristic, e.g., variance of cumulative session play)
  - Fairness/outliers
    - Most underplayed (low Reserved count vs session mean)
    - Most over-bonus (high Bonus vs session mean)
    - Most over-ref (high ref assignments vs session mean)
  - Filters and sorts
    - Filter by availability and active/inactive
    - Sort by games played, Bonus count, ref load, last played/refed, fairness indicator
  - Export
    - CSV export for per-player session stats and Big Toss snapshot
  - Performance and UX
    - Stats recompute reactively on state change (debounce 100ms)
    - Large roster (60 players) renders within 200ms on modern devices

- Implementation Details
  - Data sources and selectors
    - Compute derived stats from Session, BigToss, and Games (using `TeamSlot` types from US-005 and `Game.refs` from US-006)
    - Create memoized selectors in `dev/front-end/src/core/statsSelectors.ts`:
      - `selectPerPlayerSessionStats(session)`
      - `selectPerPlayerBigTossStats(session, bigTossId)`
      - `selectBigTossSummary(session, bigTossId)`
      - `selectRefDistribution(session, bigTossId)`
      - `selectPairingMetrics(session, bigTossId)`
    - Bench wait is computed as number of scheduled games since `lastPlayedAt` up to current point
  - UI components
    - `StatsView` (`dev/front-end/src/components/Stats/StatsView.tsx`)
      - Tabs: Per-Player | Big Toss Summary | Ref Distribution | Pairings
      - Per-Player table: sticky header, sortable columns, search/filter controls
      - Charts: simple bar/histogram using lightweight chart lib or custom SVG
      - Export buttons for CSV (per-player and current Big Toss)
  - Utilities
    - CSV export helpers in `dev/front-end/src/utils/csv.ts`
    - Pair frequency utility in `dev/front-end/src/utils/pairing.ts`
  - Persistence & performance
    - No extra persistence; derived from existing state
    - Use memoization and lightweight virtualization if row count > 50

- Implemented Details (codebase)
  - Core selectors implemented in `dev/front-end/src/core/statsSelectors.ts`:
    - Per-player session stats (games, reserved, bonus, refs assigned, bench wait, streak, fairness indicator)
    - Per-player current Big Toss stats (games in Big Toss, hasReserved, bonus count, eligibleToRefNow)
    - Big Toss summary (numGames, totalBonusSlots, per-player reserved/bonus)
    - Ref distribution (coverage and per-player assigned counts)
  - UI: `StatsView` integrated in Stats tab with polished cards and tables:
    - Sticky table headers, zebra rows, numeric tabular alignment, colored badges
    - Tabs: Per-Player | Big Toss Summary | Ref Distribution
  - Performance: selectors computed via memoization with lightweight rendering

#### Gherkin scenarios for US-007

```gherkin
Feature: US-007 View and track fairness statistics
  As a participant
  I want to view fair play and ref statistics
  So that I can see distribution and balance

  Scenario: Per-player session stats are computed and shown
    Given players [A, B, C] with recorded games and ref assignments
    When I open the Stats tab
    Then I see a table with columns for games played, reserved, bonus, refs main, refs assistant, last played, last reffed, bench wait, and streak

  Scenario: Big Toss stats reflect current cycle
    Given a current Big Toss with 2 games and some Bonus slots
    When I view the Big Toss Summary
    Then I see the number of games and total Bonus slots used
    And I see which players have no Bonus in this Big Toss

  Scenario: Ref distribution shows coverage and load
    Given scheduled games with some missing refs
    When I view the Ref Distribution
    Then I see counts of games fully staffed, missing main, and missing assistant
    And I see a bar chart of total assigned refs by player

  Scenario: Sorting and filtering
    Given the Per-Player table is visible
    When I sort by games played descending
    Then players are ordered by games played from highest to lowest
    When I filter to available players only
    Then only available players are shown

  Scenario: CSV export
    Given the Stats tab is open
    When I click "Export CSV" for Per-Player stats
    Then a CSV is downloaded containing a header row and one row per player with the visible columns
```

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
