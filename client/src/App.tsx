import {BrowserRouter, Route, Routes} from 'react-router'
import './App.css'
import GameLobby from "./Components/GameLobby.tsx";
import Home from './Home'
import NotFound from "./NotFound";
import {useEffect} from "react";
import {socketMiddleware} from "./middleware/socketMiddleware.ts";

function App() {

    useEffect(() => {
        return () => {
            socketMiddleware.disconnect()
        }
    }, []);
    return (
        <BrowserRouter>
            <Routes>
                <Route path={'/'} element={<Home/>}/>
                <Route path={'/:room/:login'} element={< GameLobby/>}/>

                <Route path={'*'} element={<NotFound />}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
