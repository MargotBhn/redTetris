import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from 'react-router';
//import App from "../App";
import Test from "../Test"
import GameLobby from "../Components/GameLobby";

// Mock du socketMiddleware
jest.mock('../middleware/socketMiddleware.ts', () => ({
    socketMiddleware: {
        connect: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
        isConnected: jest.fn(() => false),
        getId: jest.fn(() => 'mock-socket-id')
    }
}));

// test("renders Test component on /test route", () => {
//     render(
//         <MemoryRouter initialEntries={["/test"]}>
//             <Routes>
//                 <Route path="/test" element={<Test/>}/>
//                 <Route path="/:room/:login" element={<GameLobby/>}/>
//             </Routes>
//         </MemoryRouter>
//     );
//
//     expect(screen.getByText(/test/i)).toBeInTheDocument();
// })

test("renders GameLobby component on /1/alice route", async () => {
    const {socketMiddleware} = require('../middleware/socketMiddleware.ts');

    // Mock la méthode on pour simuler une connexion réussie
    socketMiddleware.on.mockImplementation((event: string, callback: any) => {
        if (event === 'connect') {
            setTimeout(() => callback(), 0); // Simule l'événement connect
        } else if (event === 'joinedSuccess') {
            setTimeout(() => callback(true), 10); // Simule joinedSuccess avec isLeader = true
        }
    });

    render(
        <MemoryRouter initialEntries={["/1/alice"]}>
            <Routes>
                <Route path="/test" element={<Test/>}/>
                <Route path="/:room/:login" element={<GameLobby/>}/>
            </Routes>
        </MemoryRouter>
    );

    // Attendre que le composant passe en mode "Waiting"
    await waitFor(() => {
        expect(screen.getByRole('heading', {name: /players/i})).toBeInTheDocument();
    });
});