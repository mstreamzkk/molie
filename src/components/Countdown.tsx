'use client';

import { useState, useEffect, useCallback } from 'react';

interface CountdownProps {
    table: number;
    onComplete: () => void;
    isPaused: boolean;
}

export default function Countdown({ table, onComplete, isPaused }: CountdownProps) {
    const [count, setCount] = useState(3);

    const handleComplete = useCallback(() => {
        onComplete();
    }, [onComplete]);

    useEffect(() => {
        if (isPaused) return;

        if (count === 0) {
            // Wait a moment on "GO!" before transitioning
            const timer = setTimeout(handleComplete, 500);
            return () => clearTimeout(timer);
        }

        const timer = setTimeout(() => {
            setCount(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [count, isPaused, handleComplete]);

    return (
        <div className="countdown-container">
            <div className="countdown-number" key={count}>
                {count === 0 ? 'GO!' : count}
            </div>
            <div className="countdown-label">
                {table}× Times Table
            </div>
        </div>
    );
}
