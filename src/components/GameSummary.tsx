'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TableResult, PersonalBests } from '@/types/game';
import { formatTime, isPersonalBest } from '@/lib/storage';
import CelebrationEffect from './CelebrationEffect';

interface GameSummaryProps {
    tableResults: TableResult[];
    skippedTables: number[];
    personalBests: PersonalBests;
    onPlayAgain: () => void;
    onBackToMenu: () => void;
}

// Get encouraging message based on accuracy percentage
function getEncouragingMessage(accuracy: number): { message: string; isSuperstar: boolean } {
    if (accuracy >= 95) {
        return { message: '🏆 SUPERSTAR! Amazing! 🌟', isSuperstar: true };
    } else if (accuracy >= 80) {
        return { message: '🌈 Fantastic work!', isSuperstar: false };
    } else if (accuracy >= 70) {
        return { message: '✨ Great progress!', isSuperstar: false };
    } else if (accuracy >= 60) {
        return { message: '👍 Well done!', isSuperstar: false };
    } else if (accuracy >= 50) {
        return { message: '🌟 Nice effort!', isSuperstar: false };
    } else if (accuracy >= 40) {
        return { message: '🎯 Getting there!', isSuperstar: false };
    } else if (accuracy >= 20) {
        return { message: '💪 Keep going!', isSuperstar: false };
    } else {
        return { message: '📚 Practice makes perfect!', isSuperstar: false };
    }
}

// Determine celebration intensity based on accuracy
function getCelebrationIntensity(accuracy: number): 'low' | 'medium' | 'high' {
    if (accuracy >= 80) return 'high';
    if (accuracy >= 50) return 'medium';
    return 'low';
}

export default function GameSummary({
    tableResults,
    skippedTables,
    personalBests,
    onPlayAgain,
    onBackToMenu,
}: GameSummaryProps) {
    const [showResultsModal, setShowResultsModal] = useState(false);

    // Calculate total time
    const totalTime = tableResults.reduce((sum, result) => sum + result.timeMs, 0);

    // Calculate accuracy
    const totalQuestions = tableResults.reduce(
        (sum, result) => sum + result.questions.length,
        0
    );
    const correctAnswers = tableResults.reduce(
        (sum, result) => sum + result.questions.filter(q => q.isCorrect).length,
        0
    );
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Count personal bests
    const personalBestCount = tableResults.filter(
        result => isPersonalBest(result.table, result.timeMs)
    ).length;

    // Get dynamic message and celebration intensity
    const { message, isSuperstar } = getEncouragingMessage(accuracy);
    const celebrationIntensity = getCelebrationIntensity(accuracy);

    return (
        <div className="game-container">
            <CelebrationEffect intensity={celebrationIntensity} />
            <div className="screen-layout summary-layout">
                {/* Header section with mascot and title */}
                <div className="summary-header">
                    <Image
                        src="/molie_icon.png"
                        alt="Molie mascot"
                        width={50}
                        height={50}
                    />
                    <div className={`summary-title ${isSuperstar ? 'superstar' : ''}`}>
                        {message}
                    </div>
                </div>

                {/* Stats card */}
                <div className="summary-stats-card">
                    <div className="summary-stat">
                        <div className="summary-stat-value">{formatTime(totalTime)}</div>
                        <div className="summary-stat-label">Total Time</div>
                    </div>
                    <div className="summary-stat-divider" />
                    <div className="summary-stat">
                        <div className="summary-stat-value">{accuracy}%</div>
                        <div className="summary-stat-label">Accuracy</div>
                    </div>
                    <div className="summary-stat-divider" />
                    <div className="summary-stat">
                        <div className="summary-stat-value">{personalBestCount}</div>
                        <div className="summary-stat-label">Personal Bests</div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="summary-actions">
                    <button className="btn btn-primary" onClick={onPlayAgain} style={{ width: '100%' }}>
                        Play Again
                    </button>
                    <button className="btn btn-secondary" onClick={onBackToMenu} style={{ width: '100%' }}>
                        Back to Menu
                    </button>
                    <button
                        className="btn btn-tertiary"
                        onClick={() => setShowResultsModal(true)}
                        style={{ width: '100%' }}
                    >
                        Review Results
                    </button>
                </div>
            </div>

            {/* Results Modal */}
            {showResultsModal && (
                <div className="results-modal-overlay" onClick={() => setShowResultsModal(false)}>
                    <div className="results-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="results-modal-header">
                            <h2>Results by Table</h2>
                            <button
                                className="results-modal-close"
                                onClick={() => setShowResultsModal(false)}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="results-modal-content">
                            {tableResults.map((result) => {
                                const isPB = isPersonalBest(result.table, result.timeMs);
                                const tableCorrect = result.questions.filter(q => q.isCorrect).length;
                                const tableTotal = result.questions.length;

                                return (
                                    <div key={result.table} className="summary-card">
                                        <div>
                                            <div className="summary-table-name">{result.table}× Table</div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                                {tableCorrect}/{tableTotal} correct
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <div className="summary-time">{formatTime(result.timeMs)}</div>
                                            {isPB && (
                                                <div className="personal-best-badge">🏆 PB!</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {skippedTables.length > 0 && (
                                <>
                                    <div style={{
                                        fontSize: 'var(--font-size-xs)',
                                        marginTop: 'var(--spacing-sm)',
                                        marginBottom: 'var(--spacing-xs)',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        Skipped
                                    </div>
                                    {skippedTables.map((table) => (
                                        <div key={table} className="summary-card" style={{ opacity: 0.6 }}>
                                            <div className="summary-table-name">{table}× Table</div>
                                            <div style={{ color: 'var(--text-secondary)' }}>Skipped</div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
