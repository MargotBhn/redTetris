import type {Cell} from "./TetrisGame.tsx";

interface BoardProps {
    grid: Cell[][]
}

export default function Board({grid}: BoardProps) {

    return (
        <div data-testid="game-board" className="border-2 border-black">
            {grid.map((row, y) => (
                <div key={y} className="flex">
                    {row.map((col, x) => (
                        <div key={x}
                             data-value={col.value}
                             className={`w-8 h-8 border-r border-b border-black ${col.color}`}></div>
                    ))}
                </div>
            ))}
        </div>

    )
}