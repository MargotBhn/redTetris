import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from 'react-router';
//import App from "../App";
import Test from "../Test"
import GameLobby from "../Components/GameLobby.tsx";

test("renders Test component on /test route", () => {
    render(
        <MemoryRouter initialEntries={["/test"]}>
            <Routes>
                <Route path="/test" element={<Test />} />
                <Route path="/:room/:login" element={<GameLobby />} />
            </Routes>
        </MemoryRouter>
    );

    expect(screen.getByText(/test/i)).toBeInTheDocument();
})

test("renders GameLobby component on /room1/alice route", () => {
    render(
      <MemoryRouter initialEntries={["/room1/alice"]}>
        <Routes>
          <Route path="/test" element={<Test />} />
          <Route path="/:room/:login" element={<GameLobby />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/game lobby/i)).toBeInTheDocument();
  });