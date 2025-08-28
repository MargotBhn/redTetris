interface WaitingRoomProps {
    leader: boolean
    listPlayers: string[]

    startGame: () => void
}

export default function WaitingRoom({leader, listPlayers, startGame}: WaitingRoomProps) {

    console.log("list players front = ", listPlayers)
    //TO DO AJOUTER UN ID SUR LES PLAYERS
    const players = listPlayers.map((player) => <p>{player}</p>)

    return (
        <>
            <h3>Players List</h3>
            <p>{players}</p>
            {leader ? <StartButton startGame={startGame}/> : null}
        </>
    )

}

interface startButtonProps {
    startGame: () => void
}

export function StartButton({startGame}: startButtonProps) {
    return <button onClick={startGame}>Start</button>
}