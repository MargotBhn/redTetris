import bgTetris from '../assets/BackgroundTetris.png'

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
        <div
            style={{
                position: "fixed",       // background fixe fullscreen
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundImage: `url(${bgTetris})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                overflow: "hidden",      // sécurité si image trop grande
              }}
            >
              {/* Texte indépendant */}
              <div
                style={{
                  position: "absolute",
                  top: "20%",             // distance depuis le haut
                  left: "50%",
                  transform: "translateX(-50%)", // centré horizontalement
                  textAlign: "center",
                  color: "#fff",
                  textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                  zIndex: 10,             // assure que le texte est au-dessus du background
                }}
              >
                  <h3>Players List</h3>
                  <p>{players}</p>
                  {leader ? <StartButton startGame={startGame}/> : null}
              </div>
            </div>
    )

}

interface startButtonProps {
    startGame: () => void
}

export function StartButton({startGame}: startButtonProps) {
    return <button onClick={startGame}>Start</button>
}

