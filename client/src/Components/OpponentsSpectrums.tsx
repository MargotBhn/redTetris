import type {spectrum} from "../middleware/socketMiddleware.ts";

/**
 * Affiche la liste des spectrums des autres joueurs sous forme de barres verticales (10 colonnes).
 */
export default function OpponentsSpectrums({opponents}: { opponents: spectrum[] }) {
    if (!opponents || opponents.length === 0) {
        return <div className="text-white">No opponents yet</div>;
    }

    return (
        <div className="flex gap-4">
            {opponents.map((op) => (
                <div key={op.socketId} className="bg-gray-900/50 rounded p-2">
                    <div className="text-xs text-white text-center mb-2">{op.username}</div>
                    <div className="flex items-end gap-1 h-40">
                        {op.spectrum.map((h: number, idx: number) => (
                            <div
                                key={idx}
                                title={`col ${idx}: ${h}`}
                                className="w-2 bg-cyan-400"
                                style={{
                                    height: `${(Math.max(0, Math.min(20, h)) / 20) * 100}%`,
                                    opacity: 0.85
                                }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
