import { render, screen } from '@testing-library/react';
import QuestionCard from '@/components/QuestionCard';
import { Question } from '@/types/game';

describe('QuestionCard', () => {
    const mockOnAnswer = jest.fn();
    const mockOnSkip = jest.fn();
    const mockOnPause = jest.fn();

    const multipleChoiceQuestion: Question = {
        id: 1,
        multiplier: 6,
        multiplicand: 7,
        correctAnswer: 42,
        questionType: 'multiple-choice',
        choices: [36, 42, 48, 54],
    };

    const freeTextQuestion: Question = {
        id: 2,
        multiplier: 8,
        multiplicand: 9,
        correctAnswer: 72,
        questionType: 'free-text',
    };

    beforeEach(() => {
        mockOnAnswer.mockClear();
        mockOnSkip.mockClear();
        mockOnPause.mockClear();
    });

    it('renders with correct quiz layout structure', () => {
        const { container } = render(
            <QuestionCard
                question={multipleChoiceQuestion}
                questionNumber={1}
                totalQuestions={12}
                tableName={6}
                onAnswer={mockOnAnswer}
                onSkip={mockOnSkip}
                onPause={mockOnPause}
                isPaused={false}
            />
        );

        // Check layout classes
        expect(container.querySelector('.screen-layout')).toBeInTheDocument();
        expect(container.querySelector('.quiz-header')).toBeInTheDocument();
        expect(container.querySelector('.quiz-question')).toBeInTheDocument();
        expect(container.querySelector('.quiz-answers')).toBeInTheDocument();
        expect(container.querySelector('.quiz-footer')).toBeInTheDocument();
    });

    it('displays question equation on one line with = ?', () => {
        render(
            <QuestionCard
                question={multipleChoiceQuestion}
                questionNumber={1}
                totalQuestions={12}
                tableName={6}
                onAnswer={mockOnAnswer}
                onSkip={mockOnSkip}
                onPause={mockOnPause}
                isPaused={false}
            />
        );

        // The equation should include "= ?"
        expect(screen.getByText(/6 × 7 = \?/)).toBeInTheDocument();
    });

    it('shows header with table name, progress, and pause button', () => {
        render(
            <QuestionCard
                question={multipleChoiceQuestion}
                questionNumber={3}
                totalQuestions={12}
                tableName={6}
                onAnswer={mockOnAnswer}
                onSkip={mockOnSkip}
                onPause={mockOnPause}
                isPaused={false}
            />
        );

        expect(screen.getByText('6× Table')).toBeInTheDocument();
        expect(screen.getByText('3 of 12')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('shows all multiple choice options', () => {
        render(
            <QuestionCard
                question={multipleChoiceQuestion}
                questionNumber={1}
                totalQuestions={12}
                tableName={6}
                onAnswer={mockOnAnswer}
                onSkip={mockOnSkip}
                onPause={mockOnPause}
                isPaused={false}
            />
        );

        expect(screen.getByText('36')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('48')).toBeInTheDocument();
        expect(screen.getByText('54')).toBeInTheDocument();
    });

    it('shows text input for free-text questions', () => {
        render(
            <QuestionCard
                question={freeTextQuestion}
                questionNumber={1}
                totalQuestions={12}
                tableName={8}
                onAnswer={mockOnAnswer}
                onSkip={mockOnSkip}
                onPause={mockOnPause}
                isPaused={false}
            />
        );

        expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('shows skip button in footer', () => {
        render(
            <QuestionCard
                question={multipleChoiceQuestion}
                questionNumber={1}
                totalQuestions={12}
                tableName={6}
                onAnswer={mockOnAnswer}
                onSkip={mockOnSkip}
                onPause={mockOnPause}
                isPaused={false}
            />
        );

        expect(screen.getByText(/skip 6× table/i)).toBeInTheDocument();
    });
});
