import bgSimple from "./assets/BackgroundSimple.png";

export default function NotFound() {
    return (
        <div
            style={{
                position: "fixed",       // background fixe fullscreen
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundImage: `url(${bgSimple})`,
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
                <p style={{fontSize: "72px", fontWeight: "bold", marginBottom: "12px"}}>
                    404 Not Found
                </p>
                <p>La page que vous recherchez n'existe pas.</p>
                <p className="text-lg mt-12">
                    Pour jouer, merci d’ajouter à l'URL : "/roomName/user_name"
                </p>
            </div>
        </div>
    );
}
