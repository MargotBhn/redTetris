import type {Piece} from "./TetrisGame.tsx";

interface NextPieceProps {
    piece: Piece | null;
}

export default function NextPiece({piece}: NextPieceProps) {
    if (!piece) {
        return <>Empty</>;
    }
    return (
        <div className="border-2 border-black">
            {piece.matrix.map((row, y) => (
                <div key={y} className="flex">
                    {row.map((col, x) => (
                        <div key={x}
                             className={`w-8 h-8 border-r border-b border-black ${col.color}`}></div>
                    ))}
                </div>
            ))}
        </div>

    )
}