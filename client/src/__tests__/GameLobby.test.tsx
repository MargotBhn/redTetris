import {render, screen} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from 'react-router';
import GameLobby, {type PlayerName} from "../Components/GameLobby";
import {socketMiddleware} from "../middleware/socketMiddleware.ts"
import {act} from "react";

// Mock du socketMiddleware pour éviter les vraies connexions socket
jest.mock("../middleware/socketMiddleware.ts", () => ({
    socketMiddleware: {
        connect: jest.fn(),
        isConnected: jest.fn(),
        getId: jest.fn(() => "mock-socket-id"),
        emitJoinRoom: jest.fn(),
        onConnect: jest.fn(),
        onJoinError: jest.fn(),
        onJoinSuccess: jest.fn(),
        onNewLeader: jest.fn(),
        onUpdatePlayerList: jest.fn(),
        onGameStarts: jest.fn(),
        onReturnLobby: jest.fn(),
        emitStartGame: jest.fn(),
        onPieceBag: jest.fn(),
        onSpectrum: jest.fn(),
        requestPieceBag: jest.fn(),
        onGarbageLines: jest.fn(),
        onEndOfGame: jest.fn(),
    }
}));

describe("GameLobby Component", () => {

    describe("URL Validation", () => {

        test("status undefined avec les bons parametres URL", () => {
            render(
                <MemoryRouter initialEntries={["/1/alice"]}>
                    <Routes>
                        <Route path="/:room/:login" element={<GameLobby/>}/>
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByText(/status empty/i)).toBeInTheDocument();
        });

        test("room URl pas un nombre", () => {
            render(
                <MemoryRouter initialEntries={["/un/alice"]}>
                    <Routes>
                        <Route path="/:room/:login" element={<GameLobby/>}/>
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByText(/Invalid room. Must be a number/i)).toBeInTheDocument();
        });

        test("room URl pas un integer", () => {
            render(
                <MemoryRouter initialEntries={["/1.1/alice"]}>
                    <Routes>
                        <Route path="/:room/:login" element={<GameLobby/>}/>
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByText(/Invalid room. Must be a number/i)).toBeInTheDocument();
        });

        test("login trop court", () => {
            render(
                <MemoryRouter initialEntries={["/1/al"]}>
                    <Routes>
                        <Route path="/:room/:login" element={<GameLobby/>}/>
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByText(/Invalid player name. Must be between 3 and 20 characters/i)).toBeInTheDocument();
        });

        test("login trop long", () => {
            const longLogin = "a".repeat(21)
            render(
                <MemoryRouter initialEntries={[`/1/${longLogin}`]}>
                    <Routes>
                        <Route path="/:room/:login" element={<GameLobby/>}/>
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByText(/Invalid player name. Must be between 3 and 20 characters/i)).toBeInTheDocument();
        });
    });

    describe("Sockets", () => {

        beforeEach(() => {
            jest.clearAllMocks();  // Reinitialise les mocks avant chaque test
        });

        test('se connecte si pas connecte au socket', () => {

            jest.mocked(socketMiddleware.isConnected).mockReturnValue(false);

            render(
                <MemoryRouter initialEntries={[`/1/playerName`]}>
                    <Routes>
                        <Route path="/:room/:login" element={<GameLobby/>}/>
                    </Routes>
                </MemoryRouter>
            );
            expect(socketMiddleware.connect).toHaveBeenCalled();
            expect(socketMiddleware.onConnect).toHaveBeenCalled();
            expect(socketMiddleware.emitJoinRoom).not.toHaveBeenCalled();
        });

        test('socket deja connecte', () => {

            jest.mocked(socketMiddleware.isConnected).mockReturnValue(true);

            render(
                <MemoryRouter initialEntries={[`/1/playerName`]}>
                    <Routes>
                        <Route path="/:room/:login" element={<GameLobby/>}/>
                    </Routes>
                </MemoryRouter>
            );
            expect(socketMiddleware.connect).not.toHaveBeenCalled();
            expect(socketMiddleware.onConnect).not.toHaveBeenCalled();
            expect(socketMiddleware.emitJoinRoom).toHaveBeenCalled();
        });

        test('partie deja en cours dans la room', () => {

            let joinErrorCallback: (() => void) | undefined
            jest.mocked(socketMiddleware.onJoinError).mockImplementation((callback) => {
                joinErrorCallback = callback;
            })

            render(
                <MemoryRouter initialEntries={[`/1/playerName`]}>
                    <Routes>
                        <Route path="/:room/:login" element={<GameLobby/>}/>
                    </Routes>
                </MemoryRouter>
            );
            act(() => joinErrorCallback!())
            expect(screen.getByText(/This room is not available. A game is already in progress/i)).toBeInTheDocument();
        });

        test('rejoint la partie avec succes et va dans la waiting room', () => {

            let joinSuccessCallback: ((isleader: boolean) => void) | undefined
            jest.mocked(socketMiddleware.onJoinSuccess).mockImplementation((callback) => {
                joinSuccessCallback = callback;
            })

            render(
                <MemoryRouter initialEntries={[`/1/playerName`]}>
                    <Routes>
                        <Route path="/:room/:login" element={<GameLobby/>}/>
                    </Routes>
                </MemoryRouter>
            );

            act(() => joinSuccessCallback!(true))
            expect(screen.getByText(/No players yet/i)).toBeInTheDocument();
        });

        test('devient leader le bouton start game apparait', () => {

            jest.mocked(socketMiddleware.isConnected).mockReturnValue(false)

            let onConnectCallback: (() => void) | undefined
            jest.mocked(socketMiddleware.onConnect).mockImplementation((callback) => {
                onConnectCallback = callback;
            })


            let joinSuccessCallback: ((isleader: boolean) => void) | undefined
            jest.mocked(socketMiddleware.onJoinSuccess).mockImplementation((callback) => {
                joinSuccessCallback = callback;
            })

            let onNewLeaderCallback: ((socket: string) => void) | undefined
            jest.mocked(socketMiddleware.onNewLeader).mockImplementation((callback) => {
                onNewLeaderCallback = callback;
            })

            render(
                <MemoryRouter initialEntries={[`/1/playerName`]}>
                    <Routes>
                        <Route path="/:room/:login" element={<GameLobby/>}/>
                    </Routes>
                </MemoryRouter>
            );

            // cree le socket ID
            act(() => onConnectCallback!())

            act(() => joinSuccessCallback!(false))
            expect(screen.queryByRole('button', {name: /Start Game/})).not.toBeInTheDocument();

            act(() => onNewLeaderCallback!('mock-socket-id'))
            expect(screen.queryByRole('button', {name: /Start Game/})).toBeInTheDocument();

        });

        test('ne devient pas leader', () => {

            jest.mocked(socketMiddleware.isConnected).mockReturnValue(false)

            let onConnectCallback: (() => void) | undefined
            jest.mocked(socketMiddleware.onConnect).mockImplementation((callback) => {
                onConnectCallback = callback;
            })


            let joinSuccessCallback: ((isleader: boolean) => void) | undefined
            jest.mocked(socketMiddleware.onJoinSuccess).mockImplementation((callback) => {
                joinSuccessCallback = callback;
            })

            let onNewLeaderCallback: ((socket: string) => void) | undefined
            jest.mocked(socketMiddleware.onNewLeader).mockImplementation((callback) => {
                onNewLeaderCallback = callback;
            })

            render(
                <MemoryRouter initialEntries={[`/1/playerName`]}>
                    <Routes>
                        <Route path="/:room/:login" element={<GameLobby/>}/>
                    </Routes>
                </MemoryRouter>
            );

            // cree le socket ID
            act(() => onConnectCallback!())

            act(() => joinSuccessCallback!(false))
            expect(screen.queryByRole('button', {name: /Start Game/})).not.toBeInTheDocument();

            act(() => onNewLeaderCallback!('wrong_socket_id'))
            expect(screen.queryByRole('button', {name: /Start Game/})).not.toBeInTheDocument();
        });

        test('mise a jour de la liste de players', () => {

            jest.mocked(socketMiddleware.isConnected).mockReturnValue(true)

            const listPlayers = [
                {name: 'player1', socketId: 'player1Id'}
            ]

            let joinSuccessCallback: ((isleader: boolean) => void) | undefined
            jest.mocked(socketMiddleware.onJoinSuccess).mockImplementation((callback) => {
                joinSuccessCallback = callback;
            })

            let onUpdatePlayerListCallback: ((listPlayers: PlayerName[]) => void) | undefined
            jest.mocked(socketMiddleware.onUpdatePlayerList).mockImplementation((callback) => {
                onUpdatePlayerListCallback = callback;
            })

            render(
                <MemoryRouter initialEntries={[`/1/playerName`]}>
                    <Routes>
                        <Route path="/:room/:login" element={<GameLobby/>}/>
                    </Routes>
                </MemoryRouter>
            );
            act(() => joinSuccessCallback!(false))
            act(() => onUpdatePlayerListCallback!(listPlayers))
            expect(screen.getByText(/player1/i)).toBeInTheDocument();
            expect(screen.queryByText(/player2/i)).not.toBeInTheDocument();

        });

        test('start game', () => {

            jest.mocked(socketMiddleware.isConnected).mockReturnValue(false)


            let joinSuccessCallback: ((isleader: boolean) => void) | undefined
            jest.mocked(socketMiddleware.onJoinSuccess).mockImplementation((callback) => {
                joinSuccessCallback = callback;
            })

            let onGameStartsCallback: (() => void) | undefined
            jest.mocked(socketMiddleware.onGameStarts).mockImplementation((callback) => {
                onGameStartsCallback = callback;
            })

            render(
                <MemoryRouter initialEntries={[`/1/playerName`]}>
                    <Routes>
                        <Route path="/:room/:login" element={<GameLobby/>}/>
                    </Routes>
                </MemoryRouter>
            );
            act(() => joinSuccessCallback!(false))
            act(() => onGameStartsCallback!())
            expect(screen.getByTestId("tetris-game")).toBeInTheDocument();

        });

        test('return lobby after end of game', () => {

            jest.mocked(socketMiddleware.isConnected).mockReturnValue(false)


            let joinSuccessCallback: ((isleader: boolean) => void) | undefined
            jest.mocked(socketMiddleware.onJoinSuccess).mockImplementation((callback) => {
                joinSuccessCallback = callback;
            })

            let onReturnLobbyCallback: (() => void) | undefined
            jest.mocked(socketMiddleware.onReturnLobby).mockImplementation((callback) => {
                onReturnLobbyCallback = callback;
            })

            render(
                <MemoryRouter initialEntries={[`/1/playerName`]}>
                    <Routes>
                        <Route path="/:room/:login" element={<GameLobby/>}/>
                    </Routes>
                </MemoryRouter>
            );
            act(() => joinSuccessCallback!(false))
            act(() => onReturnLobbyCallback!())
            expect(screen.getByText(/No players yet/i)).toBeInTheDocument();

        });


    });


});
