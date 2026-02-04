'use client';

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
            <div className="summary-title">🎉 Great Job!</div>

            {/* Stats overview */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>
                    Total Time: <strong>{formatTime(totalTime)}</strong>
                </div>
                <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
                    Accuracy: {accuracy}% ({correctAnswers}/{totalQuestions})
                </div>
            </div>

            {/* Table results */}
            <div className="summary-container">
                <div style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                    Times Tables Results
                </div>

                {tableResults.map((result) => {
                    const isPB = isPersonalBest(result.table, result.timeMs);
                    const previousBest = personalBests[result.table];
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
                            fontSize: 'var(--font-size-sm)',
                            marginTop: 'var(--spacing-lg)',
                            marginBottom: 'var(--spacing-sm)',
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

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                <button className="btn btn-primary" onClick={onPlayAgain}>
                    Play Again
                </button>
                <button className="btn btn-secondary" onClick={onBackToMenu}>
                    Back to Menu
                </button>
            </div>
        </div>
    );
}
