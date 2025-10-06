import {useParams} from "react-router";
import {useEffect, useState} from "react";
import WaitingRoom from "./WaitingRoom.tsx";
import bgSimple from "../assets/BackgroundSimple.png"
import {socketMiddleware} from "../middleware/socketMiddleware.ts";
import type {ServerPieceType} from "../middleware/socketMiddleware.ts"
import TetrisGame from "./TetrisGame.tsx";

// import WaitingRoom from "./WaitingRoom.tsx";

type StatusState = "Error" | "Waiting" | "Game" | "EndGame" | "RoomBusy";

export interface PlayerName {
    name: string,
    socketId: string,
}


function urlErrorCheck(room: string | undefined, login: string | undefined): string | null {
    if (room === undefined || login === undefined) {
        return "Room or login missing in the url";
    }
    if (isNaN(Number(room)) || !Number.isInteger(Number(room))) {
        return "Invalid room. Must be a number ";
    }
    if (login.length < 3 || login.length > 20) {
        return "Invalid player name. Must be between 3 and 20 characters";
    }
    return null
}


export default function GameLobby() {
    const {room, login} = useParams<{ room: string, login: string }>()
    const [status, setStatus] = useState<StatusState>()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [socketId, setSocketId] = useState<string | undefined>(undefined)
    const [isLeader, setIsLeader] = useState<boolean>(false)
    const [listPlayers, setListPlayers] = useState<PlayerName[]>([])

    useEffect(() => {
        //check error inside URL
        const urlError = urlErrorCheck(room, login)
        if (urlError) {
            setErrorMessage(urlError)
            setStatus("Error")
            return
        }

        // Connect to socket via middleware
        if (!socketMiddleware.isConnected()) {
            socketMiddleware.connect()
            socketMiddleware.on('connect', () => {
                setSocketId(socketMiddleware.getId())
                if (room && login) {
                    socketMiddleware.emit('joinRoom', room, login, socketMiddleware.getId())
                }
            })
        } else {
            setSocketId(socketMiddleware.getId())
            if (room && login) {
                socketMiddleware.emit('joinRoom', room, login, socketMiddleware.getId())
            }
        }
    }, [room, login]);

    useEffect(() => {
        // Setup all socket event listeners via middleware
        socketMiddleware.on('joinError', () => {
            setErrorMessage("This room is not available. A game is already in progress.")
            setStatus("RoomBusy")
        })

        socketMiddleware.on('joinedSuccess', (isLeaderGame: boolean) => {
            setErrorMessage(null)
            setIsLeader(isLeaderGame)
            setStatus("Waiting")
            // Demande explicite de la file des pièces (2 sacs déjà générés côté serveur)
            if (room) {
                socketMiddleware.emit('pieces:queue', room)
            }
        });

        socketMiddleware.on('newLeader', (socketIdLeader: string) => {
            if (socketId === socketIdLeader)
                setIsLeader(true)
        })

        socketMiddleware.on('updatePlayersList', (players: PlayerName[]) => {
            setListPlayers(players)
        })

        socketMiddleware.on('gameStarts', () => {
            setStatus('Game')
        })

        socketMiddleware.onPieceBag((bag: ServerPieceType[]) => {
                console.log(bag)
            }
        )


    }, [socketId, room]);

    const startGame = () => {
        if (socketMiddleware.isConnected()) {
            socketMiddleware.emit('startGame', room);
        }
    }

    if (status === "Error") {
        return (
            <div
                className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat overflow-hidden"
                style={{backgroundImage: `url(${bgSimple})`}}
            >
                <div className="flex flex-col items-center justify-center min-h-screen text-white gap-3 text-xl">
                    <p>Error on the URL : {errorMessage}</p>
                    <p>It should follow this model :</p>
                    <p>http://localhost:5173/room/player_name</p>
                </div>
            </div>
        )
    } else if (status === "RoomBusy") {
        return (
            <div
                className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat overflow-hidden"
                style={{backgroundImage: `url(${bgSimple})`}}
            >
                <div className="flex items-center justify-center min-h-screen text-white text-xl">
                    <p>{errorMessage}</p>
                </div>
            </div>
        )
    } else if (status === "Waiting") {
        return (
            <>
                <WaitingRoom leader={isLeader} listPlayers={listPlayers} startGame={startGame}/>
            </>
        )
    } else if (status === "Game") {
        return (
            <TetrisGame/>
        )
    } else {
        return (<>Status empty</>)
    }
}