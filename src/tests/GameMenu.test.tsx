import { render, screen } from '@testing-library/react';
import GameMenu from '@/components/GameMenu';

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ alt, ...props }: { alt: string;[key: string]: unknown }) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img alt={alt} {...props} />;
    },
}));

describe('GameMenu', () => {
    const mockOnStartGame = jest.fn();
    const mockPersonalBests = {};

    beforeEach(() => {
        mockOnStartGame.mockClear();
    });

    it('renders with correct layout structure', () => {
        render(
            <GameMenu
                personalBests={mockPersonalBests}
                onStartGame={mockOnStartGame}
            />
        );

        // Check header elements
        expect(screen.getByText('Times Tables')).toBeInTheDocument();
        expect(screen.getByText('Practice makes perfect!')).toBeInTheDocument();
        expect(screen.getByAltText('Molie mascot')).toBeInTheDocument();

        // Check body elements
        expect(screen.getByText('Select tables')).toBeInTheDocument();
        expect(screen.getByText('Clear')).toBeInTheDocument();
        expect(screen.getByText('Select All')).toBeInTheDocument();

        // Check table buttons (2-12)
        for (let i = 2; i <= 12; i++) {
            expect(screen.getByText(`${i}×`)).toBeInTheDocument();
        }

        // Check footer button
        expect(screen.getByRole('button', { name: /start practice/i })).toBeInTheDocument();
    });

    it('has screen-layout class for proper mobile layout', () => {
        const { container } = render(
            <GameMenu
                personalBests={mockPersonalBests}
                onStartGame={mockOnStartGame}
            />
        );

        expect(container.querySelector('.screen-layout')).toBeInTheDocument();
        expect(container.querySelector('.screen-header-large')).toBeInTheDocument();
        expect(container.querySelector('.screen-body')).toBeInTheDocument();
        expect(container.querySelector('.screen-footer')).toBeInTheDocument();
    });

    it('displays all table selection buttons', () => {
        render(
            <GameMenu
                personalBests={mockPersonalBests}
                onStartGame={mockOnStartGame}
            />
        );

        // Should have 11 table buttons (2-12)
        const tableButtons = screen.getAllByRole('button').filter(btn =>
            btn.classList.contains('table-btn')
        );
        expect(tableButtons).toHaveLength(11);
    });
});
