'use client';

import { useMemo } from 'react';

interface CelebrationEffectProps {
    intensity?: 'low' | 'medium' | 'high';
}

interface Bubble {
    id: number;
    left: number;
    size: number;
    delay: number;
    duration: number;
    color: string;
}

const COLORS = [
    '#FF6B6B', // coral
    '#4ECDC4', // teal
    '#FFE66D', // yellow
    '#95E1D3', // mint
    '#F8B500', // gold
    '#A855F7', // purple
    '#38BDF8', // sky blue
    '#FB7185', // pink
];

export default function CelebrationEffect({ intensity = 'medium' }: CelebrationEffectProps) {
    // Generate bubbles based on intensity
    const bubbles: Bubble[] = useMemo(() => {
        const count = intensity === 'low' ? 8 : intensity === 'medium' ? 15 : 25;

        return Array.from({ length: count }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: 8 + Math.random() * 16,
            delay: Math.random() * 3,
            duration: 3 + Math.random() * 4,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        }));
    }, [intensity]);

    return (
        <div className="celebration-container">
            {bubbles.map((bubble) => (
                <div
                    key={bubble.id}
                    className="bubble"
                    style={{
                        left: `${bubble.left}%`,
                        width: `${bubble.size}px`,
                        height: `${bubble.size}px`,
                        backgroundColor: bubble.color,
                        animationDelay: `${bubble.delay}s`,
                        animationDuration: `${bubble.duration}s`,
                        bottom: '-20px',
                    }}
                />
            ))}
        </div>
    );
}
