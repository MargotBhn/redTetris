import {render, screen} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router";
import GameOver from "../Components/GameOver.tsx";

describe('Game Over', () => {
    test('affiche game over', () => {
        render(
            <MemoryRouter initialEntries={["/1/alice"]}>
                <Routes>
                    <Route path="/:room/:login" element={<GameOver/>}/>
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText(/Game Over/i)).toBeInTheDocument();
    })
})