// Game Types for Multiplication Game

export type GameState = 'menu' | 'countdown' | 'playing' | 'paused' | 'summary' | 'tableTransition';

export type QuestionType = 'multiple-choice' | 'free-text';

export interface Question {
    id: number;
    multiplier: number;
    multiplicand: number;
    correctAnswer: number;
    questionType: QuestionType;
    choices?: number[]; // Only for multiple-choice
}

export interface QuestionResult {
    question: string;
    userAnswer: string;
    correctAnswer: number;
    isCorrect: boolean;
    timeTakenMs: number;
    questionType: QuestionType;
}

export interface TableResult {
    table: number;
    timeMs: number;
    questions: QuestionResult[];
    startedAt: string;
    completedAt: string;
}

export interface GameSession {
    id: string;
    startedAt: string;
    completedAt: string | null;
    tableResults: TableResult[];
    skippedTables: number[];
}

export interface PersonalBest {
    table: number;
    bestTimeMs: number;
    achievedAt: string;
    sessionId: string;
}

export interface PersonalBests {
    [table: number]: PersonalBest;
}

export interface GameProgress {
    currentTable: number;
    currentQuestionIndex: number;
    questions: Question[];
    tableStartTime: number;
    questionStartTime: number;
    selectedTables: number[];
    currentTableIndex: number;
}
