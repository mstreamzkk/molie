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
    onSkip: () => void;
    isPaused: boolean;
    onPause: () => void;
}

export default function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    tableName,
    onAnswer,
    onSkip,
    isPaused,
    onPause,
}: QuestionCardProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
    const [transitionState, setTransitionState] = useState<'enter' | 'idle' | 'exit'>('enter');
    const startTimeRef = useRef<number>(Date.now());
    const pausedTimeRef = useRef<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const prevQuestionRef = useRef<Question | null>(null);

    // Reset state when question changes
    useEffect(() => {
        // Only run enter animation when question actually changes
        if (prevQuestionRef.current !== question) {
            setSelectedAnswer(null);
            setInputValue('');
            setShowFeedback(false);
            setIsCorrectAnswer(false);
            setTransitionState('enter');
            startTimeRef.current = Date.now();
            pausedTimeRef.current = 0;
            prevQuestionRef.current = question;

            // Reset to idle after enter animation completes
            const enterTimer = setTimeout(() => {
                setTransitionState('idle');
            }, 300);

            // Focus input for free-text questions
            if (question.questionType === 'free-text' && inputRef.current) {
                setTimeout(() => inputRef.current?.focus(), 100);
            }

            return () => clearTimeout(enterTimer);
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
        if (showFeedback || isPaused || transitionState === 'exit') return;

        const timeTakenMs = Date.now() - startTimeRef.current;
        const isCorrect = checkAnswer(answer, question.correctAnswer);

        setSelectedAnswer(answer);
        setIsCorrectAnswer(isCorrect);
        setShowFeedback(true);

        // Show feedback, then trigger exit animation before moving to next question
        setTimeout(() => {
            setTransitionState('exit');
            // After exit animation completes, call onAnswer
            setTimeout(() => {
                onAnswer(answer, isCorrect, timeTakenMs);
            }, 250);
        }, 350);
    }, [showFeedback, isPaused, transitionState, question.correctAnswer, onAnswer]);

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            handleAnswer(inputValue.trim());
        }
    };

    // Calculate expected number of digits for the answer
    const expectedDigits = question.correctAnswer.toString().length;

    // Auto-submit when user enters the expected number of digits
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // Auto-submit when the correct number of digits is entered
        if (value.length === expectedDigits && value.trim() && !showFeedback && !isPaused) {
            handleAnswer(value.trim());
        }
    };

    const progress = (questionNumber / totalQuestions) * 100;
    const questionText = formatQuestion(question.multiplier, question.multiplicand);

    return (
        <div className="screen-layout">
            {/* Header - 10% */}
            <div className="quiz-header">
                <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
                    {tableName}× Table
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {questionNumber} of {totalQuestions}
                    </span>
                    <button
                        onClick={onPause}
                        aria-label="Pause"
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--card-bg)',
                            border: '1px solid var(--card-border)',
                            color: 'var(--text-primary)',
                            fontSize: 'var(--font-size-sm)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ⏸️
                    </button>
                </div>
            </div>

            {/* Question - 20% */}
            <div className={`quiz-question ${transitionState === 'enter' ? 'question-slide-enter' : transitionState === 'exit' ? 'question-slide-exit' : ''}`}>
                <div className="question-equation">
                    {questionText} = ?
                </div>
            </div>

            {/* Answers - 50% */}
            <div className={`quiz-answers ${transitionState === 'enter' ? 'question-slide-enter' : transitionState === 'exit' ? 'question-slide-exit' : ''}`}>
                {question.questionType === 'multiple-choice' && question.choices ? (
                    <div className="choices-grid" style={{ height: '100%', alignContent: 'center' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                        <input
                            ref={inputRef}
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="answer-input"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleInputKeyDown}
                            placeholder={`Enter ${expectedDigits} digit${expectedDigits > 1 ? 's' : ''}`}
                            disabled={showFeedback || isPaused}
                            autoFocus
                        />
                        <p style={{
                            textAlign: 'center',
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--font-size-sm)',
                            marginTop: 'var(--spacing-sm)'
                        }}>
                            {inputValue.length} / {expectedDigits} digits
                        </p>
                    </div>
                )}
            </div>

            {/* Footer - 20% */}
            <div className="quiz-footer">
                {/* Progress bar */}
                <div className="progress-bar" style={{ width: '100%', marginBottom: 'var(--spacing-sm)' }}>
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <button className="skip-btn" onClick={onSkip}>
                    Skip {tableName}× table →
                </button>
            </div>
        </div>
    );
}
