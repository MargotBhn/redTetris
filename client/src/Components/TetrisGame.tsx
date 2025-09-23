import {useEffect, useState} from "react";

// matrix[row][col]   | ->
// gameGrid[y][x]

interface Cell {
    value: number;
    color: string;
}

function getCellColor(value: number) {
    const colors: { [key: number]: string } = {
        0: 'bg-gray-200',           // Empty
        1: 'bg-cyan-500',           // I
        2: 'bg-yellow-500',         // O
        3: 'bg-purple-500',         // T
        4: 'bg-green-500',          // S
        5: 'bg-red-500',            // Z
        6: 'bg-blue-500',           // J
        7: 'bg-orange-500',         // L
        8: 'bg-black-500',          // Locked
    };
    return colors[value];
}

function createEmptyGrid() {
    return Array(20).fill(0).map(() => Array(10).fill(0).map(() => ({
        color: "bg-gray-200",
        value: 0
    })));
}

export default function TetrisGame() {
    const [grid, setGrid] = useState<Cell[][]>(createEmptyGrid());


    useEffect(() => {
        const newGrid = grid.map(row => row.map(cell => ({...cell})));
        newGrid[0][0] = {value: 1, color: getCellColor(1)}
        newGrid[19][9] = {value: 1, color: getCellColor(1)}
        setGrid(newGrid);
    }, []);


    return (
        <>
            <div className="flex items-center justify-center h-screen">
                <div className="border-2 border-black">
                    {grid.map((row, y) => (
                        <div key={y} className="flex">
                            {row.map((col, x) => (
                                <div key={x}
                                     className={`w-8 h-8 border-r border-b border-black ${col.color}`}></div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}