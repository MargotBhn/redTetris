import {BrowserRouter, Route, Routes} from 'react-router'
import './App.css'
import Test from './Test'
import GameLobby from "./Components/GameLobby.tsx";
import Home from './Home'
import {useEffect} from "react";
import {socketMiddleware} from "./middleware/socketMiddleware.ts";

function App() {

    useEffect(() => {
        socketMiddleware.connect()
        console.log('connected via the App to socket');
        return () => {
            console.log("Disconnected to the App")
            socketMiddleware.disconnect()
        }
    }, []);
    return (
        <BrowserRouter>
            <Routes>
                <Route path={'/'} element={<Home/>}/>
                <Route path={'/test'} element={<Test/>}/>
                <Route path={'/:room/:login'} element={< GameLobby/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
