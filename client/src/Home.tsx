import bgTetris from "./assets/BackgroundTetris.png";

export default function Home() {
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
                <p style={{fontSize: "48px", fontWeight: "bold", marginBottom: "12px"}}>
                    Bienvenue sur RedTetris !
                </p>
                <p>Pour jouer, merci d’ajouter à l'URL : "/roomName/user_name"</p>
            </div>
        </div>
    );
}
