import { render, screen } from '@testing-library/react';
import App from '../App';
import { socketMiddleware } from '../middleware/socketMiddleware';

// Mock des composants enfants
jest.mock('../Home', () => {
    return function Home() {
        return <div>Home Page</div>;
    };
});

jest.mock('../Components/GameLobby', () => {
    return function GameLobby() {
        return <div>Game Lobby Page</div>;
    };
});

jest.mock('../NotFound', () => {
    return function NotFound() {
        return <div>404 Not Found</div>;
    };
});

// Mock du middleware socket
jest.mock('../middleware/socketMiddleware', () => ({
    socketMiddleware: {
        disconnect: jest.fn()
    }
}));

describe('App', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('affiche la page Home sur la route /', () => {
        window.history.pushState({}, '', '/');
        render(<App />);
        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    test('affiche GameLobby avec les paramètres room et login', () => {
        window.history.pushState({}, '', '/myroom/john');
        render(<App />);
        expect(screen.getByText('Game Lobby Page')).toBeInTheDocument();
    });

    test('affiche la page 404 pour une route inexistante', () => {
        window.history.pushState({}, '', '/route-inexistante');
        render(<App />);
        expect(screen.getByText('404 Not Found')).toBeInTheDocument();
    });

    test('déconnecte le socket lors du démontage du composant', () => {
        const { unmount } = render(<App />);

        expect(socketMiddleware.disconnect).not.toHaveBeenCalled();

        unmount();

        expect(socketMiddleware.disconnect).toHaveBeenCalledTimes(1);
    });

    test('configure correctement le BrowserRouter', () => {
        const { container } = render(<App />);
        expect(container).toBeInTheDocument();
    });
});