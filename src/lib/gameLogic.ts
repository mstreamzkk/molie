// Game logic utilities for multiplication game

import { Question, QuestionType } from '@/types/game';

// Generate questions for a times table (1 to 12 in random order)
export function generateQuestions(table: number): Question[] {
    const questions: Question[] = [];

    // Create questions for 1x to 12x
    for (let i = 1; i <= 12; i++) {
        const correctAnswer = table * i;
        const questionType = shouldBeMultipleChoice();

        const question: Question = {
            id: i,
            multiplier: table,
            multiplicand: i,
            correctAnswer,
            questionType,
        };

        if (questionType === 'multiple-choice') {
            question.choices = generateAnswerChoices(correctAnswer);
        }

        questions.push(question);
    }

    // Shuffle the questions for random order
    return shuffleArray(questions);
}

// Determine if question should be multiple choice (~70% chance)
function shouldBeMultipleChoice(): QuestionType {
    return Math.random() < 0.7 ? 'multiple-choice' : 'free-text';
}

// Generate 4 answer choices including the correct one
export function generateAnswerChoices(correctAnswer: number): number[] {
    const choices = new Set<number>();
    choices.add(correctAnswer);

    // Generate plausible wrong answers
    while (choices.size < 4) {
        const offset = getPlausibleOffset(correctAnswer);
        const wrongAnswer = correctAnswer + offset;

        // Ensure the wrong answer is positive and not already added
        if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
            choices.add(wrongAnswer);
        }
    }

    // Shuffle and return
    return shuffleArray(Array.from(choices));
}

// Get a plausible offset for wrong answers
function getPlausibleOffset(correctAnswer: number): number {
    const strategies = [
        // Off by 1-3
        () => (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1),
        // Off by the multiplier (common mistake)
        () => (Math.random() < 0.5 ? 1 : -1) * Math.floor(correctAnswer / 10 + 1),
        // Off by 10
        () => (Math.random() < 0.5 ? 10 : -10),
        // Random within range
        () => (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 12) + 1),
    ];

    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    return strategy();
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get all available times tables (2 to 12)
export function getAvailableTables(): number[] {
    return [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
}

// Format question as string
export function formatQuestion(multiplier: number, multiplicand: number): string {
    return `${multiplier} × ${multiplicand}`;
}

// Check if answer is correct
export function checkAnswer(userAnswer: string, correctAnswer: number): boolean {
    const parsed = parseInt(userAnswer, 10);
    return !isNaN(parsed) && parsed === correctAnswer;
}
