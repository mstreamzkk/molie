'use client';

interface PauseOverlayProps {
    onResume: () => void;
    onQuit: () => void;
}

export default function PauseOverlay({ onResume, onQuit }: PauseOverlayProps) {
    return (
        <div className="pause-overlay">
            <div className="pause-text">⏸️ Paused</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', width: '80%', maxWidth: '300px' }}>
                <button className="btn btn-primary" onClick={onResume}>
                    Resume
                </button>
                <button className="btn btn-secondary" onClick={onQuit}>
                    Quit Game
                </button>
            </div>
        </div>
    );
}
