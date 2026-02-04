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
            question.choices = generateAnswerChoices(correctAnswer, table, i);
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

// Distractor strategy type for more realistic wrong answers
interface DistractorStrategy {
    name: string;
    weight: number; // Higher = more likely to be selected
    generate: (multiplier: number, multiplicand: number, correctAnswer: number) => number | null;
}

// Check if a distractor is within acceptable range (±25% of correct answer)
function isWithinRange(distractor: number, correctAnswer: number): boolean {
    const lowerBound = correctAnswer * 0.75;
    const upperBound = correctAnswer * 1.25;
    return distractor >= lowerBound && distractor <= upperBound;
}

// Generate 4 answer choices including the correct one using realistic test strategies
export function generateAnswerChoices(
    correctAnswer: number,
    multiplier?: number,
    multiplicand?: number
): number[] {
    const choices = new Set<number>();
    choices.add(correctAnswer);

    const mult = multiplier ?? Math.floor(correctAnswer / 6);
    const multd = multiplicand ?? 6;

    // Separate strategies into regular (must be within ±25%) and outlier (allowed outside range)
    const allStrategies = getDistractorStrategies(mult, multd, correctAnswer);
    const outlierStrategies = allStrategies.filter(s => s.name.startsWith('outlier'));
    const regularStrategies = allStrategies.filter(s => !s.name.startsWith('outlier'));

    // Shuffle regular strategies
    const shuffledRegular = shuffleArray([...regularStrategies]);

    // Track if we've added an outlier
    let hasOutlier = false;

    // Try regular strategies first (must be within ±25%)
    for (const strategy of shuffledRegular) {
        if (choices.size >= 4) break;

        const distractor = strategy.generate(mult, multd, correctAnswer);

        // Validate: positive, not duplicate, not the correct answer, within range
        if (
            distractor !== null &&
            distractor > 0 &&
            distractor !== correctAnswer &&
            !choices.has(distractor) &&
            isWithinRange(distractor, correctAnswer)
        ) {
            choices.add(distractor);
        }
    }

    // Add one outlier if we still need choices and haven't added one yet
    if (choices.size < 4 && !hasOutlier) {
        const shuffledOutliers = shuffleArray([...outlierStrategies]);
        for (const strategy of shuffledOutliers) {
            if (choices.size >= 4) break;

            const distractor = strategy.generate(mult, multd, correctAnswer);

            if (
                distractor !== null &&
                distractor > 0 &&
                distractor !== correctAnswer &&
                !choices.has(distractor)
            ) {
                choices.add(distractor);
                hasOutlier = true;
                break; // Only one outlier
            }
        }
    }

    // Fallback: if we still need more choices, use simple offsets within range
    let offset = 1;
    const maxOffset = Math.max(3, Math.floor(correctAnswer * 0.25));
    while (choices.size < 4 && offset <= maxOffset * 2) {
        const sign = Math.random() < 0.5 ? 1 : -1;
        const fallback = correctAnswer + sign * offset;
        if (
            fallback > 0 &&
            fallback !== correctAnswer &&
            !choices.has(fallback) &&
            isWithinRange(fallback, correctAnswer)
        ) {
            choices.add(fallback);
        }
        offset++;
    }

    // Last resort: just add nearby numbers
    offset = 1;
    while (choices.size < 4) {
        const fallback = correctAnswer + (choices.size % 2 === 0 ? offset : -offset);
        if (fallback > 0 && fallback !== correctAnswer && !choices.has(fallback)) {
            choices.add(fallback);
        }
        offset++;
    }

    // Shuffle and return
    return shuffleArray(Array.from(choices));
}

// Generate all distractor strategies for a given question
function getDistractorStrategies(
    multiplier: number,
    multiplicand: number,
    correctAnswer: number
): DistractorStrategy[] {
    return [
        // 1. Off by 1 or 2 (common counting error)
        {
            name: 'off-by-one',
            weight: 10,
            generate: () => correctAnswer + (Math.random() < 0.5 ? 1 : -1),
        },
        {
            name: 'off-by-two',
            weight: 8,
            generate: () => correctAnswer + (Math.random() < 0.5 ? 2 : -2),
        },

        // 2. Close number matching odd/even parity
        {
            name: 'close-same-parity',
            weight: 9,
            generate: () => {
                const offset = (Math.random() < 0.5 ? 2 : -2) * (Math.floor(Math.random() * 3) + 1);
                return correctAnswer + offset;
            },
        },

        // 3. One factor off (misread the multiplier or multiplicand)
        {
            name: 'factor-plus-one',
            weight: 10,
            generate: () => multiplier * (multiplicand + 1),
        },
        {
            name: 'factor-minus-one',
            weight: 10,
            generate: () => multiplier * (multiplicand - 1),
        },
        {
            name: 'multiplier-plus-one',
            weight: 8,
            generate: () => (multiplier + 1) * multiplicand,
        },
        {
            name: 'multiplier-minus-one',
            weight: 8,
            generate: () => (multiplier - 1) * multiplicand,
        },

        // 4. Skip count error (off by the multiplier)
        {
            name: 'skip-count-plus',
            weight: 9,
            generate: () => correctAnswer + multiplier,
        },
        {
            name: 'skip-count-minus',
            weight: 9,
            generate: () => correctAnswer - multiplier,
        },

        // 5. Addition instead of multiplication
        {
            name: 'addition-instead',
            weight: 7,
            generate: () => multiplier + multiplicand,
        },

        // 6. Square confusion (e.g., 6×7=36 thinking 6²)
        {
            name: 'square-of-multiplier',
            weight: 6,
            generate: () => multiplier * multiplier,
        },
        {
            name: 'square-of-multiplicand',
            weight: 6,
            generate: () => multiplicand * multiplicand,
        },

        // 7. Digit reversal (e.g., 72 becomes 27)
        {
            name: 'digit-reversal',
            weight: 5,
            generate: () => {
                if (correctAnswer >= 10 && correctAnswer < 100) {
                    const tens = Math.floor(correctAnswer / 10);
                    const ones = correctAnswer % 10;
                    return ones * 10 + tens;
                }
                return null;
            },
        },

        // 8. Weird outlier (much higher or lower)
        {
            name: 'outlier-high',
            weight: 4,
            generate: () => correctAnswer + Math.floor(Math.random() * 20) + 15,
        },
        {
            name: 'outlier-low',
            weight: 4,
            generate: () => Math.max(1, correctAnswer - Math.floor(Math.random() * 15) - 10),
        },

        // 9. Close multiple (near the correct answer, divisible by multiplier)
        {
            name: 'close-multiple-high',
            weight: 7,
            generate: () => {
                const next = Math.ceil(correctAnswer / multiplier) * multiplier;
                return next === correctAnswer ? next + multiplier : next;
            },
        },
        {
            name: 'close-multiple-low',
            weight: 7,
            generate: () => {
                const prev = Math.floor(correctAnswer / multiplier) * multiplier;
                return prev === correctAnswer ? prev - multiplier : Math.max(multiplier, prev);
            },
        },

        // 10. Off by 10 (place value error)
        {
            name: 'plus-ten',
            weight: 5,
            generate: () => correctAnswer + 10,
        },
        {
            name: 'minus-ten',
            weight: 5,
            generate: () => correctAnswer - 10,
        },

        // 11. Doubling error (doubled or halved)
        {
            name: 'doubled',
            weight: 3,
            generate: () => correctAnswer * 2,
        },
        {
            name: 'halved',
            weight: 3,
            generate: () => Math.floor(correctAnswer / 2),
        },
    ];
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
