import {useParams} from "react-router";
import {useEffect, useState} from "react";

// import WaitingRoom from "./WaitingRoom.ts";

type StatusState = "Error" | "Waiting" | "Game";


function UrlErrorCheck(room: string | undefined, login: string | undefined): string | null {
    if (room === undefined || login === undefined) {
        return "Room or login missing in the url";
    }
    if (isNaN(Number(room)) || !Number.isInteger(Number(room))) {
        return "Invalid room. Must be a number between 1 and 100";
    }
    if (login.length < 3 || login.length > 20) {
        return "Invalid player name. Must be between 3 and 20 characters";
    }
    return null
}

export default function GameLobby() {
    const {room, login} = useParams<{ room: string, login: string }>()
    const [status, setStatus] = useState<StatusState>()
    const [errorMessage, setErrorMessage] = useState<string>("")
    // const [leader, setLeader] = useState(false)


    useEffect(() => {
        const urlError = UrlErrorCheck(room, login)
        if (urlError) {
            setErrorMessage(urlError)
            setStatus("Error")
        } else
            setStatus("Waiting")
    }, [room, login]);


    if (status === "Error") {
        return (
            <>
                <p>Error on the URL : {errorMessage}</p>
                <p>It should follow this model :</p>
                <p>http://localhost:5173/room/player_name</p>
            </>
        )
    }
    // } else if (status === StatusState.Waiting && room && login) {
    //     return (
    //         <>
    //             <WaitingRoom room={room} login={login} leader={leader}/>
    //         </>
    //     )
    // }
    return (
        <>
            <p>Hello {login}</p>
            <p>You joined Room {room}</p>
        </>
    )
}