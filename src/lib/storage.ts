// LocalStorage service for game data persistence

import { GameSession, PersonalBests, PersonalBest } from '@/types/game';

const STORAGE_KEYS = {
    SESSIONS: 'molie_game_sessions',
    PERSONAL_BESTS: 'molie_personal_bests',
    PLAYER_ID: 'molie_player_id',
};

// Generate a unique session ID
export function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Generate or retrieve persistent player ID
export function getPlayerId(): string {
    if (typeof window === 'undefined') return '';

    let playerId = localStorage.getItem(STORAGE_KEYS.PLAYER_ID);
    if (!playerId) {
        playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem(STORAGE_KEYS.PLAYER_ID, playerId);
    }
    return playerId;
}

// Save a game session
export function saveGameSession(session: GameSession): void {
    if (typeof window === 'undefined') return;

    const sessions = getGameSessions();
    sessions.push(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    // Update personal bests
    updatePersonalBests(session);
}

// Get all game sessions
export function getGameSessions(): GameSession[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!data) return [];

    try {
        return JSON.parse(data) as GameSession[];
    } catch {
        return [];
    }
}

// Get personal bests for all tables
export function getPersonalBests(): PersonalBests {
    if (typeof window === 'undefined') return {};

    const data = localStorage.getItem(STORAGE_KEYS.PERSONAL_BESTS);
    if (!data) return {};

    try {
        return JSON.parse(data) as PersonalBests;
    } catch {
        return {};
    }
}

// Update personal bests based on a completed session
function updatePersonalBests(session: GameSession): void {
    if (typeof window === 'undefined') return;

    const currentBests = getPersonalBests();
    let updated = false;

    for (const tableResult of session.tableResults) {
        const table = tableResult.table;
        const time = tableResult.timeMs;

        if (!currentBests[table] || time < currentBests[table].bestTimeMs) {
            currentBests[table] = {
                table,
                bestTimeMs: time,
                achievedAt: tableResult.completedAt,
                sessionId: session.id,
            };
            updated = true;
        }
    }

    if (updated) {
        localStorage.setItem(STORAGE_KEYS.PERSONAL_BESTS, JSON.stringify(currentBests));
    }
}

// Get the last session for comparison
export function getLastSession(): GameSession | null {
    const sessions = getGameSessions();
    if (sessions.length === 0) return null;
    return sessions[sessions.length - 1];
}

// Check if a time is a personal best for a table
export function isPersonalBest(table: number, timeMs: number): boolean {
    const bests = getPersonalBests();
    return !bests[table] || timeMs < bests[table].bestTimeMs;
}

// Format time in milliseconds to MM:SS
export function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format time with milliseconds precision MM:SS.mmm
export function formatTimeDetailed(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}
