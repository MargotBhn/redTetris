import {render, screen} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router";
import Home from "../Home.tsx";


describe('Home', () => {
    test('affiche la page home', () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText(/Bienvenue sur RedTetris/i)).toBeInTheDocument();
    })
})