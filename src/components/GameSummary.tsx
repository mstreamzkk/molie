'use client';

import Image from 'next/image';
import { TableResult, PersonalBests } from '@/types/game';
import { formatTime, isPersonalBest } from '@/lib/storage';

interface GameSummaryProps {
    tableResults: TableResult[];
    skippedTables: number[];
    personalBests: PersonalBests;
    onPlayAgain: () => void;
    onBackToMenu: () => void;
}

export default function GameSummary({
    tableResults,
    skippedTables,
    personalBests,
    onPlayAgain,
    onBackToMenu,
}: GameSummaryProps) {
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
                    />
                    <div className="summary-title" style={{ marginBottom: 'var(--spacing-xs)' }}>
                        🎉 Great Job!
                    </div>
                    <div className="card" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', textAlign: 'center' }}>
                        <div style={{ fontSize: 'var(--font-size-base)', marginBottom: '4px' }}>
                            Time: <strong>{formatTime(totalTime)}</strong>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                            Accuracy: {accuracy}% ({correctAnswers}/{totalQuestions})
                        </div>
                    </div>
                </div>

                {/* Body - 50% */}
                <div className="screen-body">
                    <div style={{
                        fontSize: 'var(--font-size-sm)',
                        marginBottom: 'var(--spacing-xs)',
                        color: 'var(--text-secondary)',
                        padding: '0 var(--spacing-xs)'
                    }}>
                        Results
                    </div>

                    <div className="screen-body-scroll">
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

                {/* Footer - 20% */}
                <div className="screen-footer">
                    <button className="btn btn-primary" onClick={onPlayAgain} style={{ width: '100%' }}>
                        Play Again
                    </button>
                    <button className="btn btn-secondary" onClick={onBackToMenu} style={{ width: '100%' }}>
                        Back to Menu
                    </button>
                </div>
            </div>
        </div>
    );
}
