import { render, screen } from '@testing-library/react';
import GameSummary from '@/components/GameSummary';
import { TableResult } from '@/types/game';

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ alt, ...props }: { alt: string;[key: string]: unknown }) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img alt={alt} {...props} />;
    },
}));

// Mock the storage functions
jest.mock('@/lib/storage', () => ({
    formatTime: (ms: number) => `${(ms / 1000).toFixed(1)}s`,
    isPersonalBest: () => false,
}));

describe('GameSummary', () => {
    const mockOnPlayAgain = jest.fn();
    const mockOnBackToMenu = jest.fn();
    const mockPersonalBests = {};

    const mockTableResults: TableResult[] = [
        {
            table: 6,
            timeMs: 15000,
            questions: [
                { question: '6 × 7', userAnswer: '42', correctAnswer: 42, isCorrect: true, timeTakenMs: 2000, questionType: 'multiple-choice' },
                { question: '6 × 8', userAnswer: '48', correctAnswer: 48, isCorrect: true, timeTakenMs: 2500, questionType: 'multiple-choice' },
            ],
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
        },
    ];

    beforeEach(() => {
        mockOnPlayAgain.mockClear();
        mockOnBackToMenu.mockClear();
    });

    it('renders with correct layout structure', () => {
        const { container } = render(
            <GameSummary
                tableResults={mockTableResults}
                skippedTables={[]}
                personalBests={mockPersonalBests}
                onPlayAgain={mockOnPlayAgain}
                onBackToMenu={mockOnBackToMenu}
            />
        );

        expect(container.querySelector('.screen-layout')).toBeInTheDocument();
        expect(container.querySelector('.screen-header-large')).toBeInTheDocument();
        expect(container.querySelector('.screen-body')).toBeInTheDocument();
        expect(container.querySelector('.screen-footer')).toBeInTheDocument();
    });

    it('displays celebration message and mascot', () => {
        const { container } = render(
            <GameSummary
                tableResults={mockTableResults}
                skippedTables={[]}
                personalBests={mockPersonalBests}
                onPlayAgain={mockOnPlayAgain}
                onBackToMenu={mockOnBackToMenu}
            />
        );

        // Dynamic message shows based on accuracy (100% = "SUPERSTAR")
        expect(container.querySelector('.summary-dynamic-message')).toBeInTheDocument();
        expect(screen.getByText(/superstar/i)).toBeInTheDocument();
        expect(screen.getByAltText('Molie mascot')).toBeInTheDocument();
    });

    it('shows total time and accuracy', () => {
        render(
            <GameSummary
                tableResults={mockTableResults}
                skippedTables={[]}
                personalBests={mockPersonalBests}
                onPlayAgain={mockOnPlayAgain}
                onBackToMenu={mockOnBackToMenu}
            />
        );

        expect(screen.getByText(/time:/i)).toBeInTheDocument();
        expect(screen.getByText(/accuracy:/i)).toBeInTheDocument();
        expect(screen.getByText(/100%/)).toBeInTheDocument();
    });

    it('shows table results', () => {
        render(
            <GameSummary
                tableResults={mockTableResults}
                skippedTables={[]}
                personalBests={mockPersonalBests}
                onPlayAgain={mockOnPlayAgain}
                onBackToMenu={mockOnBackToMenu}
            />
        );

        expect(screen.getByText('6× Table')).toBeInTheDocument();
        expect(screen.getByText('2/2 correct')).toBeInTheDocument();
    });

    it('shows footer buttons', () => {
        render(
            <GameSummary
                tableResults={mockTableResults}
                skippedTables={[]}
                personalBests={mockPersonalBests}
                onPlayAgain={mockOnPlayAgain}
                onBackToMenu={mockOnBackToMenu}
            />
        );

        expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /back to menu/i })).toBeInTheDocument();
    });

    it('shows skipped tables when present', () => {
        render(
            <GameSummary
                tableResults={mockTableResults}
                skippedTables={[7, 8]}
                personalBests={mockPersonalBests}
                onPlayAgain={mockOnPlayAgain}
                onBackToMenu={mockOnBackToMenu}
            />
        );

        // 'Skipped' appears as section header and for each skipped table row
        const skippedElements = screen.getAllByText('Skipped');
        expect(skippedElements.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('7× Table')).toBeInTheDocument();
        expect(screen.getByText('8× Table')).toBeInTheDocument();
    });
});
