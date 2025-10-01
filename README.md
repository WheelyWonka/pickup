# Pickup! - Basketball Game Scheduler

A React-based application for organizing and scheduling pickup basketball games with fair player rotation and referee assignment.

## What is Pickup!
Pickup! helps organizers run fair, continuous pickup sessions. It builds balanced 3v3 games, rotates players so everyone gets a chance to play, and assigns two referees per game. The app adapts live as players join or leave, keeping things fair and minimizing disruption.

## Core Concepts
- **Session**: A full run of play. Contains players, Big Tosses, stats, and state persisted in the browser.
- **Big Toss**: A cycle containing one or more scheduled Games.
- **Game**: Two teams of 3 players (3v3) plus 2 refs (main, assistant).
- **Reserved Slot**: Guarantees a player plays at least once per Big Toss (max one Reserved per player per Big Toss).
- **Bonus Slot**: Additional participation in a Game for someone who has already played in the Big Toss, allocated by fairness.
- **Refs**: Two non-playing, available players per Game (main and assistant), distributed fairly across the Session.

## How it works
1. Add players to your Session and generate a Big Toss.
2. The app creates `ceil(N/6)` Games so each player gets exactly one Reserved slot in the Big Toss.
3. Remaining slots in the last Game are filled as Bonus slots using fairness (fewest bonus uses, etc.).
4. Two eligible refs are assigned to each Game, prioritizing those who have reffed less this Session.
5. If players are added/removed, teams and refs are recalculated minimally and fairly:
   - New players get a Reserved slot in the current Big Toss; Bonus slots adjust fairly.
   - If a Game becomes Bonus-only, it’s deleted and refs are cleared.
   - If a ref becomes a player in that Game, a new fair ref is selected.

## Fairness rules (high level)
- Bonus slots go first to players with the fewest session Bonus appearances, then by:
  1) Fewest games in current Big Toss
  2) Earliest last played
  3) Name (alphabetical)
- Ref selection prioritizes lowest total assigned refs (scheduled + completed), then:
  1) Earliest last reffed (joinedAt if missing)
  2) Name (alphabetical)

## Status
- Front-end only; all logic runs client-side.
- Session state persists in localStorage with versioning and migrations.

## Features

- **Session Management**: Create and manage game sessions
- **Player Roster**: Add/remove players with availability tracking
- **Big Toss Generation**: Automatically generate fair game rotations
- **Team Composition**: Reserved/Bonus slot system for flexible roster changes
- **Referee Assignment**: Fair distribution of referee duties
- **Statistics Tracking**: Comprehensive fairness metrics and analytics

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Persistence**: localStorage with versioning
- **Deployment**: GitHub Pages

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   cd dev/front-end
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Build

```bash
cd dev/front-end
npm run build
```

## Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

- **Live URL**: https://pickup.montrealbikepolo.ca
- **GitHub Pages**: https://[username].github.io/pickup

## Project Structure

```
dev/front-end/
├── src/
│   ├── components/     # React components
│   ├── core/          # Business logic
│   ├── hooks/         # Custom React hooks
│   ├── store/         # State management
│   ├── types/         # TypeScript definitions
│   └── utils/         # Utility functions
├── public/            # Static assets
└── dist/              # Build output
```

## User Stories

- **US-001**: Create a new Session ✅
- **US-002**: View Session dashboard ✅
- **US-003**: Manage players in Session ✅
- **US-004**: Start a Big Toss ✅
- **US-005**: Compose Games (team building) ✅
- **US-006**: Assign refs per Game ✅
- **US-007**: View and track fairness statistics ✅

For full implementation details and acceptance criteria, see `docs/TASKS.md`.

## License

MIT License
