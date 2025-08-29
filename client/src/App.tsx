import {BrowserRouter, Route, Routes} from 'react-router'
import './App.css'
import Test from './Test'
import GameLobby from "./Components/GameLobby.tsx";
import Home from './Home'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={'/'} element={<Home />} />
                <Route path={'/test'} element={<Test/>}/>
                <Route path={'/:room/:login'} element={< GameLobby/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
