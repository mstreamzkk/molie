'use client';

import { useState } from 'react';
import Image from 'next/image';
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

    const clearAll = () => {
        // Keep at least one table selected (first one)
        setSelectedTables([allTables[0]]);
    };

    const handleStart = () => {
        if (selectedTables.length > 0) {
            onStartGame(selectedTables);
        }
    };

    return (
        <div className="game-container">
            <div className="screen-layout">
                {/* Header - 30% */}
                <div className="screen-header-large">
                    <Image
                        src="/molie_icon.png"
                        alt="Molie mascot"
                        width={60}
                        height={60}
                        style={{ maxHeight: '8vh', width: 'auto', height: 'auto' }}
                        priority
                    />
                    <div className="menu-title">Times Tables</div>
                    <div className="menu-subtitle">Practice makes perfect!</div>
                </div>

                {/* Body - 50% */}
                <div className="screen-body">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--spacing-sm)',
                        padding: '0 var(--spacing-xs)'
                    }}>
                        <span style={{ fontSize: 'var(--font-size-sm)' }}>
                            Select tables
                        </span>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button
                                onClick={clearAll}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: 'var(--font-size-xs)'
                                }}
                            >
                                Clear
                            </button>
                            <button
                                onClick={selectAll}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent-blue)',
                                    cursor: 'pointer',
                                    fontSize: 'var(--font-size-xs)'
                                }}
                            >
                                Select All
                            </button>
                        </div>
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
                                                fontSize: '0.55rem',
                                                opacity: 0.7,
                                                marginTop: '1px'
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

                {/* Footer - 20% */}
                <div className="screen-footer">
                    <button
                        className="btn btn-primary"
                        onClick={handleStart}
                        disabled={selectedTables.length === 0}
                        style={{ width: '100%' }}
                    >
                        Start Practice ({selectedTables.length} tables)
                    </button>
                </div>
            </div>
        </div>
    );
}
