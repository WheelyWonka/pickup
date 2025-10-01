# Pickup! - Basketball Game Scheduler

A React-based application for organizing and scheduling pickup basketball games with fair player rotation and referee assignment.

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

## License

MIT License
