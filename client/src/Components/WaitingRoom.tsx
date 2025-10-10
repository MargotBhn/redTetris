import bgTetris from '../assets/BackgroundTetris.png'
import type {PlayerName} from "./GameLobby.tsx";

interface WaitingRoomProps {
    leader: boolean
    listPlayers: PlayerName[]

    startGame: () => void
}

export default function WaitingRoom({leader, listPlayers, startGame}: WaitingRoomProps) {

    const players = listPlayers.map((player, idx) =>
        <div key={player?.socketId ?? idx} className="font-semibold text-lg">
            {typeof player === "string" ? player : player?.name ?? <span className="text-red-400">No name</span>}
        </div>
    )

    return (
        <div
            className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat overflow-hidden"
            style={{backgroundImage: `url(${bgTetris})`}}
        >
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 text-center text-white z-10 overflow-y-auto max-h-[80%]"
                 style={{textShadow: "0 2px 8px rgba(0,0,0,0.6)"}}
            >
                <div className="p-8 border-4 border-yellow-400 rounded-xl"
                     style={{
                         background: "rgba(0,0,0,0.7)", // Ajout d'un fond semi-transparent
                     }}
                >
                    <h3 className="text-2xl font-bold text-yellow-400 mb-4 uppercase">
                        Players
                    </h3>
                    <div className="mb-6 space-y-2">
                        {listPlayers.length === 0 ? (
                            <div className="font-semibold text-lg">No players yet</div>
                        ) : (
                            players
                        )}
                    </div>
                    <div>
                        {leader && <StartButton startGame={startGame}/>}
                    </div>
                </div>
            </div>
        </div>
    )

}

interface startButtonProps {
    startGame: () => void
}

export function StartButton({startGame}: startButtonProps) {
    return (
        <button
            onClick={startGame}
            className="px-6 py-4 bg-green-600 text-white font-bold rounded-xl border-2 border-green-500
            hover:bg-green-500 hover:border-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]
            transition-all duration-300 text-lg uppercase tracking-wider"
        >
            Start Game
        </button>

    )
}

