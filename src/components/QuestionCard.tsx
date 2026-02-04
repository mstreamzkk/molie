'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Question } from '@/types/game';
import { formatQuestion, checkAnswer } from '@/lib/gameLogic';

interface QuestionCardProps {
    question: Question;
    questionNumber: number;
    totalQuestions: number;
    tableName: number;
    onAnswer: (answer: string, isCorrect: boolean, timeTakenMs: number) => void;
    isPaused: boolean;
}

export default function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    tableName,
    onAnswer,
    isPaused,
}: QuestionCardProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
    const startTimeRef = useRef<number>(Date.now());
    const pausedTimeRef = useRef<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset state when question changes
    useEffect(() => {
        setSelectedAnswer(null);
        setInputValue('');
        setShowFeedback(false);
        setIsCorrectAnswer(false);
        startTimeRef.current = Date.now();
        pausedTimeRef.current = 0;

        // Focus input for free-text questions
        if (question.questionType === 'free-text' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [question]);

    // Track paused time
    useEffect(() => {
        if (isPaused) {
            pausedTimeRef.current = Date.now();
        } else if (pausedTimeRef.current > 0) {
            // Adjust start time by the paused duration
            const pausedDuration = Date.now() - pausedTimeRef.current;
            startTimeRef.current += pausedDuration;
            pausedTimeRef.current = 0;
        }
    }, [isPaused]);

    const handleAnswer = useCallback((answer: string) => {
        if (showFeedback || isPaused) return;

        const timeTakenMs = Date.now() - startTimeRef.current;
        const isCorrect = checkAnswer(answer, question.correctAnswer);

        setSelectedAnswer(answer);
        setIsCorrectAnswer(isCorrect);
        setShowFeedback(true);

        // Brief delay before moving to next question
        setTimeout(() => {
            onAnswer(answer, isCorrect, timeTakenMs);
        }, 600);
    }, [showFeedback, isPaused, question.correctAnswer, onAnswer]);

    const handleInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            handleAnswer(inputValue.trim());
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            handleAnswer(inputValue.trim());
        }
    };

    const progress = (questionNumber / totalQuestions) * 100;
    const questionText = formatQuestion(question.multiplier, question.multiplicand);

    return (
        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="header">
                <span className="header-title">{tableName}× Times Table</span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {questionNumber} of {totalQuestions}
                </span>
            </div>

            {/* Progress bar */}
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Question */}
            <div className="question-equation">
                {questionText} = ?
            </div>

            {/* Answers */}
            {question.questionType === 'multiple-choice' && question.choices ? (
                <div className="choices-grid">
                    {question.choices.map((choice, index) => {
                        let buttonClass = 'btn btn-choice';
                        if (showFeedback && selectedAnswer === String(choice)) {
                            buttonClass += isCorrectAnswer ? ' correct' : ' incorrect';
                        }
                        if (showFeedback && choice === question.correctAnswer && !isCorrectAnswer) {
                            buttonClass += ' correct';
                        }

                        return (
                            <button
                                key={index}
                                className={buttonClass}
                                onClick={() => handleAnswer(String(choice))}
                                disabled={showFeedback || isPaused}
                            >
                                {choice}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <form onSubmit={handleInputSubmit} style={{ marginTop: 'auto', paddingBottom: 'var(--spacing-lg)' }}>
                    <input
                        ref={inputRef}
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="answer-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        placeholder="Type your answer"
                        disabled={showFeedback || isPaused}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                        disabled={!inputValue.trim() || showFeedback || isPaused}
                    >
                        Submit
                    </button>
                </form>
            )}
        </div>
    );
}
