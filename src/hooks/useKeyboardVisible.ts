'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect when the virtual keyboard is visible on mobile devices.
 * Uses the Visual Viewport API to detect viewport height changes caused by keyboard.
 */
export function useKeyboardVisible(): boolean {
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        const visualViewport = window.visualViewport;
        if (!visualViewport) return;

        // Store the initial viewport height (without keyboard)
        const initialHeight = visualViewport.height;
        // Threshold: if viewport shrinks by more than 150px, keyboard is likely open
        const KEYBOARD_THRESHOLD = 150;

        const handleResize = () => {
            const currentHeight = visualViewport.height;
            const heightDiff = initialHeight - currentHeight;

            // Keyboard is considered visible if viewport shrunk significantly
            setIsKeyboardVisible(heightDiff > KEYBOARD_THRESHOLD);
        };

        visualViewport.addEventListener('resize', handleResize);

        // Initial check
        handleResize();

        return () => {
            visualViewport.removeEventListener('resize', handleResize);
        };
    }, []);

    return isKeyboardVisible;
}
