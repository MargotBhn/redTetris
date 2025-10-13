import {socketMiddleware} from "../middleware/socketMiddleware.ts";

interface endGameProps {
    room :string
}

export default function EndGame({room} : endGameProps){
    const returnLobby = () => {
            socketMiddleware.emitReturnLobby(room)
    }
    return (
        <button
            onClick={returnLobby}
            className="px-6 py-4 bg-green-600 text-white font-bold rounded-xl border-2 border-green-500
                hover:bg-green-500 hover:border-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]
                transition-all duration-300 text-lg uppercase tracking-wider"
        >
            Start a new game
        </button>
    )
}