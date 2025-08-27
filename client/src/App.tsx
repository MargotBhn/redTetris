import {BrowserRouter, Route, Routes} from 'react-router'
import './App.css'
import Test from './Test'
import GameLobby from "./Components/GameLobby.tsx";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path={'/test'} element={<Test/>}/>
                <Route path={'/:room/:login'} element={< GameLobby/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
