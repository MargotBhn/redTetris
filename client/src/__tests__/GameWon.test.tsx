import {render, screen} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router";
import GameWon from "../Components/GameWon.tsx";


describe('Game won', () => {
    test('affiche game won', () => {
        render(
            <MemoryRouter initialEntries={["/1/alice"]}>
                <Routes>
                    <Route path="/:room/:login" element={<GameWon/>}/>
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText(/you won/i)).toBeInTheDocument();
    })
})