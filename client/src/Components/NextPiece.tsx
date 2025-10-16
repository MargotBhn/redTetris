import type {Piece} from "../types/tetrisTypes.ts";


interface NextPieceProps {
    piece: Piece | null;
}

export default function NextPiece({piece}: NextPieceProps) {
    if (!piece) {
        return <>Empty</>;
    }
    return (
        <div className="ml-2 p-4 border-2 border-white rounded-lg w-30 h-30 flex flex-col items-center">
            <h3 className="text-white text-lg font-semibold mb-2">NEXT</h3>
            <div className="flex flex-1 items-center justify-center">
                <div>
                    {piece.matrix.map((row, y) => (
                        <div key={y} className="flex">
                            {row.map((col, x) => (
                                <div key={x}
                                     className={`w-6 h-6 ${col == 1 ? `border border-gray-800 ${piece.color}` : ''}`}></div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>

    )
}