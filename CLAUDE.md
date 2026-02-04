# Molie - Times Tables Practice App

## Overview

Molie is a Next.js 16 / React 19 interactive multiplication quiz application designed to help users practice their times tables (2-12) with timed challenges, personal best tracking, and performance feedback.

## Tech Stack

- **Framework**: Next.js 16.1.6
- **UI**: React 19.2.3
- **Language**: TypeScript 5
- **Testing**: Jest 30.2.0 + React Testing Library 16.3.2
- **Styling**: CSS with CSS variables (custom design system)
- **Storage**: Browser localStorage
- **Mobile-optimized**: Yes (viewport settings, touch-friendly buttons, keyboard detection)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with metadata & viewport config
│   ├── page.tsx             # Main app component (central state manager)
│   ├── globals.css          # Global styles with design tokens (~1000 lines)
│   └── page.module.css      # Legacy module styles
├── components/
│   ├── QuestionCard.tsx     # Question UI (handles both question types)
│   ├── GameMenu.tsx         # Menu for table selection
│   ├── GameSummary.tsx      # Results screen with stats and celebrations
│   ├── Countdown.tsx        # 3-2-1-GO countdown before questions
│   ├── PauseOverlay.tsx     # Pause screen overlay
│   ├── TableTransition.tsx  # High-five celebration between tables
│   └── CelebrationEffect.tsx # Animated floating bubbles on summary
├── hooks/
│   └── useKeyboardVisible.ts # Detects mobile keyboard visibility
├── lib/
│   ├── gameLogic.ts         # Question generation & validation
│   └── storage.ts           # localStorage management
├── tests/
│   ├── GameMenu.test.tsx    # Menu component tests
│   ├── QuestionCard.test.tsx # Question card tests
│   └── GameSummary.test.tsx # Summary screen tests
└── types/
    └── game.ts              # TypeScript type definitions
```

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run Jest in watch mode
```

## Game State Flow

```
MENU → COUNTDOWN → PLAYING → TABLE TRANSITION → (next table countdown or) SUMMARY
                      ↓
                  [PAUSED]
```

- **menu**: Table selection screen
- **countdown**: 3-2-1-GO before questions start
- **playing**: Active question answering
- **paused**: Game paused overlay
- **tableTransition**: High-five celebration between completed tables
- **summary**: Results and personal bests display

## Key Features

- **Two Question Types**:
  - Multiple-choice (~70%): 4 answer buttons in 2×2 grid, instant click submission
  - Free-text (~30%): Numeric input, auto-submits when correct number of digits entered

- **Sophisticated Distractors**: 11 different error types for wrong answers, weighted by likelihood of student error (off-by-one, factor confusion, skip counting errors, etc.)

- **Personal Bests**: Tracked per table in localStorage with badge display

- **Pause System**: Excludes pause time from scoring

- **Skip Table**: Option to skip current table and move to next

- **Celebration Effects**: High-five animations between tables, floating bubbles on summary

- **Mobile Keyboard Detection**: Compact layout when virtual keyboard is visible

## Key Files

- `src/app/page.tsx` - Central state manager, all game flow logic
- `src/components/QuestionCard.tsx` - Question display and answer handling
- `src/lib/gameLogic.ts` - Question generation, distractor algorithm, and answer validation
- `src/lib/storage.ts` - localStorage persistence for sessions and personal bests
- `src/types/game.ts` - All TypeScript interfaces (Question, GameSession, PersonalBest, etc.)

## Type Definitions

```typescript
type GameState = 'menu' | 'countdown' | 'playing' | 'paused' | 'summary' | 'tableTransition'
type QuestionType = 'multiple-choice' | 'free-text'

interface Question {
  id: number
  multiplier: number
  multiplicand: number
  correctAnswer: number
  questionType: QuestionType
  choices?: number[]  // For multiple-choice only
}

interface TableResult {
  table: number
  timeMs: number
  questions: QuestionResult[]
  startedAt: number
  completedAt: number
}

interface GameSession {
  id: string
  startedAt: number
  completedAt: number | null
  tableResults: TableResult[]
  skippedTables: number[]
}

interface PersonalBest {
  table: number
  bestTimeMs: number
  achievedAt: number
  sessionId: string
}
```

## Design System

CSS variables defined in `globals.css`:

**Colors:**
- Background gradient: `#1a1a4e → #2d2d7a → #4a3f91`
- Accents: `--accent-blue: #5b8def`, `--accent-purple: #7c5ce7`
- Feedback: `--success-green: #4ade80`, `--error-red: #f87171`
- Cards: 10% white bg with blur, 20% white borders

**Typography:** 8 sizes from `--font-size-xs` (0.875rem) to `--font-size-5xl` (8rem)

**Spacing:** 6 scales from `--spacing-xs` (0.5rem) to `--spacing-2xl` (3rem)

**Key CSS Classes:**
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-tertiary` - Button variants
- `.btn-choice` - Answer choice buttons
- `.question-equation` - Large equation display with fluid sizing
- `.screen-layout` - Flex column layout for full-height screens
- `.keyboard-compact-*` - Compact layout when mobile keyboard visible

**Layout Splits:**
- Menu/Summary: Header (30%) | Body (50%) | Footer (20%)
- Quiz: Header (10%) | Question (20%) | Answers (50%) | Footer (20%)

## Architecture Notes

- **State-driven**: Parent (`page.tsx`) manages all game state, child components are fully controlled
- **Callback communication**: Children communicate via callback props (onAnswer, onPause, onSkip, etc.)
- **Timing accuracy**: All timing calculations account for pause duration using refs
- **Questions pre-generated**: 12 questions per table generated at countdown complete
- **Session persistence**: Game sessions saved to localStorage only on completion
- **'use client' directive**: Used in all interactive components for client-side rendering

## Testing

Tests are located in `src/tests/` and use Jest + React Testing Library.

```bash
npm run test         # Run all tests
npm run test:watch   # Watch mode
```

**Test coverage:**
- `GameMenu.test.tsx` - Layout structure, table display, selection buttons
- `QuestionCard.test.tsx` - Quiz layout, equation display, both question types
- `GameSummary.test.tsx` - Layout, stats display, modal interaction, skipped tables

## Coding Conventions

**Naming:**
- Components: PascalCase (`GameMenu`, `QuestionCard`)
- Hooks: camelCase with 'use' prefix (`useKeyboardVisible`)
- Functions: camelCase (`generateQuestions`, `checkAnswer`)
- CSS classes: kebab-case (`.question-equation`, `.btn-primary`)

**React Patterns:**
- `useCallback` for handler functions to prevent re-renders
- `useRef` for timing and mutable values that don't trigger re-renders
- `useMemo` for expensive computations (e.g., bubble generation)

**File Organization:**
- Components in `/components` (UI elements)
- Hooks in `/hooks` (custom React hooks)
- Lib in `/lib` (pure utility functions)
- Types in `/types` (TypeScript interfaces)
- Tests in `/tests` (Jest test files)

**Path Aliases:** Use `@/*` for imports from `src/` (e.g., `@/components/GameMenu`)

## localStorage Keys

- `molie_game_sessions` - All completed game sessions
- `molie_personal_bests` - Best times per table
- `molie_player_id` - Persistent player identifier
