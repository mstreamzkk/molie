'use client';

import { useEffect, useState } from 'react';

interface TableTransitionProps {
    completedTable: number;
    nextTable: number;
    onComplete: () => void;
}

export default function TableTransition({
    completedTable,
    nextTable,
    onComplete,
}: TableTransitionProps) {
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        // Show message after high-five animation
        const messageTimer = setTimeout(() => {
            setShowMessage(true);
        }, 150);

        // Auto-advance after celebration
        const advanceTimer = setTimeout(() => {
            onComplete();
        }, 700);

        return () => {
            clearTimeout(messageTimer);
            clearTimeout(advanceTimer);
        };
    }, [onComplete]);

    return (
        <div className="table-transition-container">
            {/* High-five SVG animation */}
            <div className="high-five-animation">
                <svg
                    viewBox="0 0 150 150"
                    className="high-five-hands"
                >
                    {/* Left hand */}
                    <g transform="translate(20, 40)">
                        <path
                            d="M45 80 L45 55 L40 25 L45 0 M45 55 L35 20 M45 55 L55 20 M45 55 L60 35 M45 80 L25 70"
                            stroke="#FFD89B"
                            strokeWidth="8"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <circle cx="45" cy="85" r="15" fill="#FFD89B" />
                    </g>
                    {/* Right hand */}
                    <g transform="translate(80, 40) scale(-1, 1) translate(-50, 0)">
                        <path
                            d="M45 80 L45 55 L40 25 L45 0 M45 55 L35 20 M45 55 L55 20 M45 55 L60 35 M45 80 L25 70"
                            stroke="#FFD89B"
                            strokeWidth="8"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <circle cx="45" cy="85" r="15" fill="#FFD89B" />
                    </g>
                    {/* Impact sparkles */}
                    <g className="sparkles">
                        <circle cx="75" cy="50" r="4" fill="#FFD700">
                            <animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite" />
                            <animate attributeName="r" values="2;6;2" dur="0.6s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="60" cy="35" r="3" fill="#FFA500">
                            <animate attributeName="opacity" values="0;1;0" dur="0.5s" begin="0.1s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="90" cy="35" r="3" fill="#FFA500">
                            <animate attributeName="opacity" values="0;1;0" dur="0.5s" begin="0.2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="75" cy="25" r="2" fill="#FFEC8B">
                            <animate attributeName="opacity" values="0;1;0" dur="0.4s" begin="0.15s" repeatCount="indefinite" />
                        </circle>
                    </g>
                </svg>
            </div>

            {/* Celebration message */}
            <div className="transition-message">
                🎉 Awesome work on {completedTable}×!
            </div>

            {showMessage && (
                <div className="transition-submessage">
                    Get ready for {nextTable}× table...
                </div>
            )}
        </div>
    );
}
