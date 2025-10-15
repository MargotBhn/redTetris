import {render, screen} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router";
import NotFound from "../NotFound.tsx";


describe('Not Found', () => {
    test('affiche la page 404', () => {
        render(
            <MemoryRouter initialEntries={['/gfsdasdfdfs']}>
                <Routes>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText(/404 Not Found/i)).toBeInTheDocument();
    })
})