# Molie - Times Tables Practice App

## Overview

Molie is a Next.js 16 / React 19 interactive multiplication quiz application designed to help users practice their times tables (2-12) with timed challenges, personal best tracking, and performance feedback.

## Tech Stack

- **Framework**: Next.js 16.1.6
- **UI**: React 19.2.3
- **Language**: TypeScript
- **Styling**: CSS with CSS variables (custom design system)
- **Storage**: Browser localStorage
- **Mobile-optimized**: Yes (viewport settings, touch-friendly buttons)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with metadata & viewport config
│   ├── page.tsx             # Main app component (state management hub)
│   ├── globals.css          # Global styles with design tokens
│   └── page.module.css      # Page-specific styles
├── components/
│   ├── QuestionCard.tsx     # Question UI (handles both question types)
│   ├── GameMenu.tsx         # Menu for table selection
│   ├── GameSummary.tsx      # Results screen
│   ├── Countdown.tsx        # 3-2-1-GO countdown
│   └── PauseOverlay.tsx     # Pause screen
├── lib/
│   ├── gameLogic.ts         # Question generation & validation
│   └── storage.ts           # localStorage management
└── types/
    └── game.ts              # TypeScript type definitions
```

## Game State Flow

```
MENU → COUNTDOWN → PLAYING → (next table or) SUMMARY
              ↓
          [PAUSED]
```

- **menu**: Table selection screen
- **countdown**: 3-2-1-GO before questions start
- **playing**: Active question answering
- **paused**: Game paused overlay
- **summary**: Results and personal bests display

## Key Features

- **Two Question Types**:
  - Multiple-choice (~70%): 4 answer buttons, instant click submission
  - Free-text (~30%): Numeric input, auto-submits when correct digit count entered

- **Personal Bests**: Tracked per table in localStorage
- **Pause System**: Excludes pause time from scoring
- **Skip Table**: Option to skip current table and move to next

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Key Files

- `src/app/page.tsx` - Central state manager, all game flow logic
- `src/components/QuestionCard.tsx` - Question display and answer handling
- `src/lib/gameLogic.ts` - Question generation and answer validation
- `src/lib/storage.ts` - localStorage persistence for sessions and personal bests

## Design System

CSS variables defined in `globals.css`:
- Colors: Gradient backgrounds, accent colors, feedback colors (success/error)
- Typography: 8 font sizes (xs to 5xl)
- Spacing: 6 scales (xs to 2xl)
- Components: `.btn`, `.btn-primary`, `.btn-choice`, `.question-equation`

## Architecture Notes

- State-driven architecture with parent (`page.tsx`) managing all game state
- Child components are fully controlled, communicate via callbacks
- All timing calculations account for pause duration
- Questions pre-generated at table start (12 questions per table)
- Session saved to localStorage only on game completion
