# Pickup! - Game Scheduling App

A front-end React application for managing 3v3 pickup sports games with automated team rotation, referee assignment, and fairness tracking.

## Features

- **Session Management**: Create and manage game sessions
- **Player Roster**: Add/remove players, toggle availability
- **Big Toss Generation**: Automated game scheduling with balanced 3v3 teams
- **Referee Assignment**: Fair rotation of refs based on session statistics
- **Filled Game Logic**: Handles odd player counts intelligently
- **Statistics Tracking**: Per-player fairness metrics and game history
- **Offline First**: All data persists to localStorage

## Tech Stack

- **React 19** with **TypeScript**
- **Vite** for fast development and building
- **Context API** for state management
- **localStorage** for client-side persistence

## Project Structure

```
src/
├── components/       # React UI components
│   ├── Session/     # Session-related components
│   ├── Player/      # Player management components
│   ├── Schedule/    # Game schedule views
│   ├── Stats/       # Statistics and tracking
│   ├── Game/        # Individual game components
│   └── common/      # Shared/reusable components
├── core/            # Business logic
│   ├── sessionFactory.ts   # Session/Player creation
│   ├── teamGenerator.ts    # Game generation algorithm
│   └── refSelector.ts      # Referee assignment logic
├── store/           # State management
│   └── SessionContext.tsx  # Global session state
├── types/           # TypeScript type definitions
│   └── models.ts    # Core data models
├── utils/           # Utility functions
│   ├── idGenerator.ts      # ID generation
│   ├── localStorage.ts     # Persistence layer
│   └── shuffle.ts          # Array shuffling
└── hooks/           # Custom React hooks

```

## Data Model

- **Session**: Contains players, big tosses, settings
- **BigToss**: A cycle of games generated from the player roster
- **Game**: 3v3 match with teams and refs assigned
- **Player**: Individual participant with stats and availability

See [TASKS.md](../../docs/TASKS.md) for detailed requirements and specifications.

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

## Development Roadmap

### ✅ Phase 1: Foundation (Complete)
- Core data models
- State management setup
- Team generation algorithm
- Referee selection logic
- localStorage persistence

### 🚧 Phase 2: Core UI (In Progress)
- [ ] SessionToolbar component
- [ ] PlayerList component
- [ ] ScheduleView component
- [ ] GameCard component
- [ ] StatsView component

### 📋 Phase 3: Advanced Features
- [ ] Filled game logic
- [ ] New player injection during Big Toss
- [ ] Manual overrides for teams/refs
- [ ] Game state transitions
- [ ] Fairness indicators

### 🎨 Phase 4: Polish
- [ ] Responsive design
- [ ] Accessibility improvements
- [ ] CSV export
- [ ] Undo/redo functionality
- [ ] Keyboard navigation

## Contributing

This is a personal/team project. Please refer to the main repository guidelines.

## License

Private - All rights reserved
