import {useParams} from "react-router";
import {useEffect, useState} from "react";
import {io, Socket} from "socket.io-client";
import WaitingRoom from "./WaitingRoom.tsx";


// import WaitingRoom from "./WaitingRoom.tsx";

type StatusState = "Error" | "Waiting" | "Game" | "EndGame";


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
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isLeader, setIsLeader] = useState<boolean>(false)
    const [listPlayers, setListPlayers] = useState<string[]>([])

    useEffect(() => {
        //check error inside URL
        const urlError = urlErrorCheck(room, login)
        if (urlError) {
            setErrorMessage(urlError)
            setStatus("Error")
            return
        }

        // Check room availability
        if (room && login && !socket) {
            const newSocket = io("http://localhost:3000");
            setSocket(newSocket)
            setSocketId(newSocket.id)
        }

    }, [room, login]);

    useEffect(() => {
        if (socket) {
            socket.on('connect', () => {
                setSocketId(socket.id);
                socket.emit('joinRoom', room, login, socket.id);

            });


            socket.on('joinError', () => {
                setErrorMessage("This room is not available. A game is already in progress.")
                setStatus("Error")
            })

            socket.on('joinedSuccess', (isLeaderGame: boolean) => {
                setErrorMessage(null)
                setIsLeader(isLeaderGame)
                setStatus("Waiting")
            });

            socket.on('newLeader', (socketIdLeader: string) => {
                if (socketId === socketIdLeader)
                    setIsLeader(true)
            })

            socket.on('updatePlayersList', (players: string[]) => {
                setListPlayers(players)
            })

            socket.on('gameStarts', () => {
                console.log('status Game')
                setStatus('Game')
            })
        }
    }, [socket, socketId]);

    const startGame = () => {
        if (socket) {
            socket.emit('startGame', room);
        }
    }


    if (status === "Error") {
        return (
            <>
                <p>Error on the URL : {errorMessage}</p>
                <p>It should follow this model :</p>
                <p>http://localhost:5173/room/player_name</p>
            </>
        )
    } else if (status === "Waiting") {
        return (
            <>
                <WaitingRoom leader={isLeader} listPlayers={listPlayers} startGame={startGame}/>
            </>
        )
    } else if (status === "Game") {
        return (
            <p>Let's Game</p>
        )
    } else {
        return (<>Status empty</>)
    }
}