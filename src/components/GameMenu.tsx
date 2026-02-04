'use client';

import { useState } from 'react';
import { PersonalBests } from '@/types/game';
import { getAvailableTables } from '@/lib/gameLogic';
import { formatTime } from '@/lib/storage';

interface GameMenuProps {
    personalBests: PersonalBests;
    onStartGame: (selectedTables: number[]) => void;
}

export default function GameMenu({ personalBests, onStartGame }: GameMenuProps) {
    const allTables = getAvailableTables();
    const [selectedTables, setSelectedTables] = useState<number[]>(allTables);

    const toggleTable = (table: number) => {
        setSelectedTables(prev => {
            if (prev.includes(table)) {
                // Don't allow deselecting if it's the last one
                if (prev.length === 1) return prev;
                return prev.filter(t => t !== table);
            }
            return [...prev, table].sort((a, b) => a - b);
        });
    };

    const selectAll = () => {
        setSelectedTables(allTables);
    };

    const handleStart = () => {
        if (selectedTables.length > 0) {
            onStartGame(selectedTables);
        }
    };

    const hasPreviousGames = Object.keys(personalBests).length > 0;

    return (
        <div className="game-container">
            <div className="menu-container">
                <div>
                    <div className="menu-title">🧮 Times Tables</div>
                    <div className="menu-subtitle">Practice makes perfect!</div>
                </div>

                {/* Table selection */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        <span style={{ fontSize: 'var(--font-size-base)' }}>
                            Select tables to practice
                        </span>
                        <button
                            onClick={selectAll}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent-blue)',
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-sm)'
                            }}
                        >
                            Select All
                        </button>
                    </div>

                    <div className="table-selection">
                        {allTables.map((table) => {
                            const isSelected = selectedTables.includes(table);
                            const hasBest = personalBests[table];

                            return (
                                <button
                                    key={table}
                                    className={`table-btn ${isSelected ? 'selected' : ''}`}
                                    onClick={() => toggleTable(table)}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span>{table}×</span>
                                        {hasBest && (
                                            <span style={{
                                                fontSize: '0.6rem',
                                                opacity: 0.7,
                                                marginTop: '2px'
                                            }}>
                                                {formatTime(hasBest.bestTimeMs)}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Personal bests section */}
                {hasPreviousGames && (
                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <div style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--text-secondary)',
                            textAlign: 'center'
                        }}>
                            🏆 Personal bests shown on each table
                        </div>
                    </div>
                )}

                {/* Start button */}
                <button
                    className="btn btn-primary"
                    onClick={handleStart}
                    disabled={selectedTables.length === 0}
                    style={{ marginTop: 'auto' }}
                >
                    Start Practice ({selectedTables.length} tables)
                </button>
            </div>
        </div>
    );
}
